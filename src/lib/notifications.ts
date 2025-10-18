import { toast } from 'sonner';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private registrationPromise: Promise<ServiceWorkerRegistration | null>;

  private constructor() {
    this.permission = Notification.permission;
    this.registrationPromise = this.getServiceWorkerRegistration();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        return registration;
      } catch (error) {
        console.error('Service Worker not available:', error);
        return null;
      }
    }
    return null;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    if (this.permission !== 'denied') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission === 'granted') {
      toast.success('Notifications enabled successfully!');
    } else if (this.permission === 'denied') {
      toast.error('Notifications were denied. Please enable them in your browser settings.');
    }

    return this.permission;
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    try {
      const registration = await this.registrationPromise;
      
      if (registration) {
        // Use service worker for persistent notifications
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/icon-72x72.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          actions: options.actions,
          data: {
            url: window.location.origin,
            timestamp: Date.now()
          }
        });
      } else {
        // Fallback to regular notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false
        });
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
      toast.error('Failed to show notification');
    }
  }

  async scheduleNotification(options: NotificationOptions, delay: number): Promise<void> {
    setTimeout(() => {
      this.showNotification(options);
    }, delay);
  }

  async scheduleDailyReminder(time: string = '09:00'): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    this.scheduleNotification({
      title: 'FaisyKoott Reminder',
      body: 'Don\'t forget to record your expenses and income for today!',
      icon: '/icons/icon-192x192.png',
      tag: 'daily-reminder',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open App', icon: '/icons/icon-72x72.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    }, delay);

    toast.success(`Daily reminder set for ${time}`);
  }

  async scheduleExpenseReminder(amount: number, category: string): Promise<void> {
    // Schedule reminder for large expenses
    if (amount > 100) { // Configurable threshold
      this.scheduleNotification({
        title: 'Large Expense Recorded',
        body: `You recorded a ${category} expense of $${amount.toFixed(2)}`,
        icon: '/icons/icon-192x192.png',
        tag: 'expense-alert',
        requireInteraction: false
      }, 2000); // 2 second delay
    }
  }

  async scheduleBudgetAlert(category: string, spent: number, budget: number): Promise<void> {
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 80) {
      this.showNotification({
        title: 'Budget Alert',
        body: `You've spent ${percentage.toFixed(0)}% of your ${category} budget`,
        icon: '/icons/icon-192x192.png',
        tag: 'budget-alert',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Budget', icon: '/icons/icon-72x72.png' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }
  }

  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }
}

// Bookkeeping-specific notification helpers
export class BookkeepingNotifications {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  async notifyTransactionAdded(type: 'income' | 'expense', amount: number, category: string): Promise<void> {
    const title = type === 'income' ? 'Income Added' : 'Expense Added';
    const body = `${type === 'income' ? 'Received' : 'Spent'} $${amount.toFixed(2)} on ${category}`;

    await this.notificationService.showNotification({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      tag: `transaction-${type}`,
      silent: true
    });

    // Schedule budget alert for expenses
    if (type === 'expense') {
      await this.notificationService.scheduleExpenseReminder(amount, category);
    }
  }

  async notifyGoalReached(goalType: string, amount: number): Promise<void> {
    await this.notificationService.showNotification({
      title: 'Goal Achieved! 🎉',
      body: `You've reached your ${goalType} goal of $${amount.toFixed(2)}`,
      icon: '/icons/icon-192x192.png',
      tag: 'goal-reached',
      requireInteraction: true,
      actions: [
        { action: 'celebrate', title: 'View Details', icon: '/icons/icon-72x72.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  async setupDailyReminders(): Promise<void> {
    await this.notificationService.scheduleDailyReminder('09:00');
  }

  async notifyBackupReminder(): Promise<void> {
    await this.notificationService.showNotification({
      title: 'Backup Reminder',
      body: 'Consider backing up your financial data',
      icon: '/icons/icon-192x192.png',
      tag: 'backup-reminder',
      requireInteraction: false
    });
  }
}

// Export singleton instance
export const bookkeepingNotifications = new BookkeepingNotifications();
export const notificationService = NotificationService.getInstance();
