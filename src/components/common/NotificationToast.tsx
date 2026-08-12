
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useFleetStore } from '../../store/fleetStore';

export default function NotificationToast() {
  const { notifications, removeNotification } = useFleetStore();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notif) => {
        let borderColor = '';
        let Icon = Info;
        let iconColor = '';

        switch (notif.type) {
          case 'success':
            borderColor = 'border-l-[var(--color-fleet-green)]';
            iconColor = 'text-[var(--color-fleet-green)]';
            Icon = CheckCircle;
            break;
          case 'error':
            borderColor = 'border-l-[var(--color-fleet-red)]';
            iconColor = 'text-[var(--color-fleet-red)]';
            Icon = AlertCircle;
            break;
          case 'warning':
            borderColor = 'border-l-[var(--color-fleet-yellow)]';
            iconColor = 'text-[var(--color-fleet-yellow)]';
            Icon = AlertTriangle;
            break;
          case 'info':
          default:
            borderColor = 'border-l-[var(--color-fleet-accent)]';
            iconColor = 'text-[var(--color-fleet-accent)]';
            Icon = Info;
            break;
        }

        return (
          <div 
            key={notif.id} 
            className={`bg-[var(--color-fleet-panel)] border border-[var(--color-fleet-border)] border-l-2 ${borderColor} rounded-md px-4 py-3 flex items-center gap-3 shadow-lg min-w-[280px] toast-enter`}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <span className="flex-1 text-sm text-[var(--color-fleet-text)]">{notif.message}</span>
            <button 
              onClick={() => removeNotification(notif.id)}
              className="text-[var(--color-fleet-text-secondary)] hover:text-[var(--color-fleet-text)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
