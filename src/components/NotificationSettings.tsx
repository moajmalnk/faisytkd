import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Clock, IndianRupee, Target, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { notificationService, bookkeepingNotifications } from '@/lib/notifications';

interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string;
  expenseAlerts: boolean;
  expenseThreshold: number;
  budgetAlerts: boolean;
  budgetThreshold: number;
  goalAlerts: boolean;
  transactionNotifications: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  dailyReminder: true,
  dailyReminderTime: '09:00',
  expenseAlerts: true,
  expenseThreshold: 100,
  budgetAlerts: true,
  budgetThreshold: 80,
  goalAlerts: true,
  transactionNotifications: false
};

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check notification support
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermission());

    // Load saved settings
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
    toast.success('Notification settings saved');
  };

  const handleEnableNotifications = async () => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        const newSettings = { ...settings, enabled: true };
        saveSettings(newSettings);
        
        // Set up daily reminders if enabled
        if (newSettings.dailyReminder) {
          await bookkeepingNotifications.setupDailyReminders();
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const handleDisableNotifications = () => {
    const newSettings = { ...settings, enabled: false };
    saveSettings(newSettings);
    toast.info('Notifications disabled');
  };

  const handleSettingChange = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);

    // Handle specific setting changes
    if (key === 'dailyReminder' && value && settings.enabled) {
      bookkeepingNotifications.setupDailyReminders();
    }
  };

  const testNotification = async () => {
    if (permission !== 'granted') {
      toast.error('Please enable notifications first');
      return;
    }

    await notificationService.showNotification({
      title: 'Test Notification',
      body: 'This is a test notification from NKBook!',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification'
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Notifications Not Supported</CardTitle>
          </div>
          <CardDescription>
            Your browser doesn't support notifications or you're browsing in an unsupported environment.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>
            Configure when and how you'd like to receive notifications about your finances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Allow NKBook to send you notifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              {permission !== 'granted' && (
                <Button 
                  onClick={handleEnableNotifications}
                  size="sm"
                  variant={settings.enabled ? "default" : "outline"}
                >
                  {permission === 'denied' ? 'Enable in Browser' : 'Enable'}
                </Button>
              )}
              <Switch
                checked={settings.enabled && permission === 'granted'}
                onCheckedChange={settings.enabled ? handleDisableNotifications : handleEnableNotifications}
                disabled={permission === 'denied'}
              />
            </div>
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            </div>
          )}

          {settings.enabled && permission === 'granted' && (
            <>
              {/* Test Notification */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Test Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send a test notification to verify everything is working
                  </p>
                </div>
                <Button onClick={testNotification} variant="outline" size="sm">
                  Test
                </Button>
              </div>

              <div className="border-t pt-6 space-y-6">
                {/* Daily Reminders */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <Label className="text-base">Daily Reminders</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get reminded to record your daily expenses
                      </p>
                    </div>
                    <Switch
                      checked={settings.dailyReminder}
                      onCheckedChange={(checked) => handleSettingChange('dailyReminder', checked)}
                    />
                  </div>

                  {settings.dailyReminder && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="reminder-time">Reminder Time</Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={settings.dailyReminderTime}
                        onChange={(e) => handleSettingChange('dailyReminderTime', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                </div>

                {/* Expense Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-primary" />
                        <Label className="text-base">Large Expense Alerts</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you record large expenses
                      </p>
                    </div>
                    <Switch
                      checked={settings.expenseAlerts}
                      onCheckedChange={(checked) => handleSettingChange('expenseAlerts', checked)}
                    />
                  </div>

                  {settings.expenseAlerts && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="expense-threshold">Alert threshold (₹)</Label>
                      <Input
                        id="expense-threshold"
                        type="number"
                        value={settings.expenseThreshold}
                        onChange={(e) => handleSettingChange('expenseThreshold', Number(e.target.value))}
                        className="w-32"
                        min="0"
                        step="10"
                      />
                    </div>
                  )}
                </div>

                {/* Budget Alerts */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <Label className="text-base">Budget Alerts</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get warned when approaching budget limits
                      </p>
                    </div>
                    <Switch
                      checked={settings.budgetAlerts}
                      onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                    />
                  </div>

                  {settings.budgetAlerts && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="budget-threshold">Alert at (% of budget)</Label>
                      <Select
                        value={settings.budgetThreshold.toString()}
                        onValueChange={(value) => handleSettingChange('budgetThreshold', Number(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="75">75%</SelectItem>
                          <SelectItem value="80">80%</SelectItem>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Goal Alerts */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <Label className="text-base">Goal Achievement</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Celebrate when you reach your financial goals
                    </p>
                  </div>
                  <Switch
                    checked={settings.goalAlerts}
                    onCheckedChange={(checked) => handleSettingChange('goalAlerts', checked)}
                  />
                </div>

                {/* Transaction Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Transaction Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified for every transaction you add
                    </p>
                  </div>
                  <Switch
                    checked={settings.transactionNotifications}
                    onCheckedChange={(checked) => handleSettingChange('transactionNotifications', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to get current notification settings
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notification-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  return settings;
}
