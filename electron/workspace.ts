/**
 * Git worktree helpers used by task runs, merge, and discard.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { simpleGit } from 'simple-git'
import type { SimpleGit } from 'simple-git'

export function genId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function slugAgent(agent: string): string {
  return agent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'agent'
}

export async function getMainRepoRoot(workdir: string): Promise<string> {
  const git = simpleGit(workdir)
  try {
    const gitCommonDir = (await git.raw(['rev-parse', '--git-common-dir'])).trim()
    return resolve(workdir, gitCommonDir, '..')
  } catch {
    return (await git.revparse(['--show-toplevel'])).trim()
  }
}

export async function excludeAgentWorktrees(repoRoot: string): Promise<void> {
  const gitPath = join(repoRoot, '.git')
  if (!existsSync(gitPath)) return
  try {
    const isDir = statSync(gitPath).isDirectory()
    if (!isDir) return
    const excludePath = join(gitPath, 'info', 'exclude')
    mkdirSync(join(gitPath, 'info'), { recursive: true })
    let current = ''
    try {
      current = readFileSync(excludePath, 'utf8')
    } catch {
      current = ''
    }
    if (!current.includes('.agent-worktrees')) {
      appendFileSync(excludePath, '\n# Robent isolated agent checkouts\n.agent-worktrees/\n')
    }
  } catch {
    /* ignore */
  }
}

export async function createIsolatedWorktree(
  repoDir: string,
  branchName: string,
  folderName: string,
  baseBranch?: string,
): Promise<{ workdir: string; branch: string; repoRoot: string }> {
  const repoRoot = await getMainRepoRoot(repoDir)
  await excludeAgentWorktrees(repoRoot)
  const git: SimpleGit = simpleGit(repoRoot)
  const wtRoot = join(repoRoot, '.agent-worktrees')
  mkdirSync(wtRoot, { recursive: true })
  const wtPath = join(wtRoot, folderName)

  // Prune any stale disconnected worktrees first
  await git.raw(['worktree', 'prune']).catch(() => undefined)

  // If worktree target directory already exists, force cleanup to avoid collision
  if (existsSync(wtPath)) {
    await git.raw(['worktree', 'remove', '--force', wtPath]).catch(() => undefined)
    try {
      rmSync(wtPath, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  }

  // Clear any existing stale branch of the same name
  await git.deleteLocalBranch(branchName, true).catch(() => undefined)

  const args = ['worktree', 'add', '-b', branchName, wtPath]
  if (baseBranch) args.push(baseBranch)
  await git.raw(args)
  return { workdir: wtPath, branch: branchName, repoRoot }
}

export async function removeWorktree(worktree: string, branch?: string | null): Promise<void> {
  const repoRoot = await getMainRepoRoot(worktree).catch(() => resolve(worktree, '..', '..'))
  const git = simpleGit(repoRoot)
  await git.raw(['worktree', 'remove', '--force', worktree]).catch(() => undefined)
  if (existsSync(worktree)) {
    try {
      rmSync(worktree, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  }
  await git.raw(['worktree', 'prune']).catch(() => undefined)
  if (branch) {
    await git.deleteLocalBranch(branch, true).catch(() => undefined)
  }
}

export async function mergeWorktreeIntoHead(worktree: string, branch: string): Promise<string> {
  const repoRoot = await getMainRepoRoot(worktree)
  const git = simpleGit(repoRoot)
  const targetBranch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim()
  if (!targetBranch || targetBranch === 'HEAD') throw new Error('Repository is in detached HEAD state')
  await git.checkout(targetBranch)
  try {
    await git.merge([branch, '--no-ff', '-m', `Merge ${branch} into ${targetBranch}`])
  } catch (mergeError) {
    await git.merge(['--abort']).catch(() => undefined)
    throw mergeError
  }
  try {
    await git.raw(['worktree', 'remove', '--force', worktree])
    await git.deleteLocalBranch(branch, true)
  } catch {
    /* ignore cleanup failures after a successful merge */
  }
  return targetBranch
}

export async function commitAndDiff(workdir: string, message: string): Promise<{ diff: string; changes: number }> {
  const git = simpleGit(workdir)
  try {
    await git.addConfig('user.name', 'Robent Agent', false, 'local')
    await git.addConfig('user.email', 'agent@robent.local', false, 'local')
  } catch {
    /* ignore */
  }
  await git.add('.')
  const status = await git.status()
  const changed = new Set([
    ...status.staged,
    ...status.created,
    ...status.modified,
    ...status.deleted,
    ...status.renamed.map((item) => item.to),
    ...status.not_added,
  ]).size
  if (status.staged.length > 0 || status.created.length > 0 || status.modified.length > 0 || status.deleted.length > 0) {
    await git.commit(message)
    const diff = await git.diff(['HEAD~1']).catch(() => git.diff(['HEAD']))
    return { diff: diff || '', changes: changed }
  }
  const diff = await git.diff(['HEAD']).catch(() => '')
  return { diff: diff || '', changes: changed }
}

export async function listLocalBranches(repoDir: string): Promise<{ current: string; all: string[] }> {
  const git = simpleGit(repoDir)
  const summary = await git.branchLocal()
  return { current: summary.current, all: summary.all }
}

export async function isGitRepo(dir: string): Promise<boolean> {
  try {
    await simpleGit(dir).revparse(['--is-inside-work-tree'])
    return true
  } catch {
    return false
  }
}
