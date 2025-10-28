import { useState, useEffect } from 'react';
import { useBookkeeping } from '@/hooks/useBookkeeping';
import { useAuth } from '@/hooks/useAuth';
import { CollectionsList } from '@/components/CollectionsList';
import { PaymentsList } from '@/components/PaymentsList';
import { IncomeList } from '@/components/IncomeList';
import { ExpenseList } from '@/components/ExpenseList';
import { CategoryList } from '@/components/CategoryList';
import { AccountsOverview } from '@/components/AccountsOverview';
import { AccountsChart } from '@/components/AccountsChart';
import { IncomeVsExpenseChart } from '@/components/IncomeVsExpenseChart';
import { ExpenseDistributionChart } from '@/components/ExpenseDistributionChart';
import { BookkeepingSkeleton } from '@/components/BookkeepingSkeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { NotificationSettings } from '@/components/NotificationSettings';
import { PinScreen } from '@/components/PinScreen';
import { PatternScreen } from '@/components/PatternScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, TrendingDown, Wallet, IndianRupee, Target, Percent, LogOut, AlertTriangle, Eye, Camera } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Image } from '@radix-ui/react-avatar';
import { SecurityAPI, API_BASE } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const {
    data,
    totals,
    analytics,
    isLoading,
    operationLoading,
    addCollectItem,
    updateCollectItem,
    deleteCollectItem,
    markCollectItemAsCompleted,
    addPayItem,
    updatePayItem,
    deletePayItem,
    markPayItemAsCompleted,
    addIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    addExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    updateAccount,
    addAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useBookkeeping();

  const { 
    isAuthenticated, 
    login, 
    logout, 
    pinAttempts, 
    showPatternScreen, 
    incrementPinAttempts, 
    handlePatternCorrect 
  } = useAuth();
  const [isPrivate, setIsPrivate] = useState(() => {
    // Load privacy mode from localStorage on initialization
    try {
      const savedPrivacyMode = localStorage.getItem('privacy-mode');
      return savedPrivacyMode === 'true';
    } catch (error) {
      // Handle iOS Safari private browsing mode
      console.warn('Could not access localStorage:', error);
      return false;
    }
  });

  // Save privacy mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('privacy-mode', isPrivate.toString());
    } catch (error) {
      console.warn('Could not save privacy mode:', error);
    }
  }, [isPrivate]);
  
  const netBalance = totals.collect - totals.pay;

  const [intrusionsOpen, setIntrusionsOpen] = useState(false);
  const [intrusions, setIntrusions] = useState<Array<{ id: number; ip: string | null; user_agent: string | null; photo_path: string; created_at: string; meta?: string | null }>>([]);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pinError, setPinError] = useState('');
  const [pinMode, setPinMode] = useState<'view'|'delete'>('view');

  const captureIntrusionPhoto = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Camera access not supported on this device');
        return;
      }

      // Attempt to capture from existing webcam stream via a temporary video element
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: false 
      });
      const video = document.createElement('video');
      video.srcObject = stream as any;
      await video.play();
      await new Promise(r => setTimeout(r, 200)); // small warmup
      const width = video.videoWidth || 320;
      const height = video.videoHeight || 240;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no ctx');
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      stream.getTracks().forEach(t => t.stop());
      await SecurityAPI.reportIntrusion(dataUrl);
    } catch (error) {
      console.error('Failed to capture intrusion photo:', error);
      // Handle iOS-specific camera permission issues
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.warn('Camera permission denied');
        } else if (error.name === 'NotFoundError') {
          console.warn('No camera found on this device');
        } else if (error.name === 'NotSupportedError') {
          console.warn('Camera not supported on this device');
        }
      }
    }
  };

  const openIntrusions = async () => {
    setPinMode('view');
    setPinValue('');
    setPinError('');
    setPinDialogOpen(true);
  };

  const requestDelete = (id: number) => {
    setPinMode('delete');
    setDeletingId(id);
    setPinValue('');
    setPinError('');
    setPinDialogOpen(true);
  };

  const confirmDeleteWithPin = async () => {
    if (pinValue !== '0777') {
      setPinError('Incorrect PIN');
      return false;
    }
    if (pinMode === 'delete') {
      if (deletingId == null) return false;
      try {
        await SecurityAPI.deleteIntrusion(deletingId);
        setIntrusions(prev => prev.filter(i => i.id !== deletingId));
        setPinDialogOpen(false);
        setDeletingId(null);
        return true;
      } catch {
        setPinError('Delete failed');
        return false;
      }
    } else {
      try {
        const res = await SecurityAPI.listIntrusions(24);
        setIntrusions(res.items);
        setPinDialogOpen(false);
        setIntrusionsOpen(true);
        return true;
      } catch {
        setPinError('Load failed');
        return false;
      }
    }
  };

  if (isLoading) {
    return <BookkeepingSkeleton />;
  }

  if (!isAuthenticated) {
    if (showPatternScreen) {
      return <PatternScreen onPatternCorrect={handlePatternCorrect} />;
    }
    return (
      <PinScreen 
        onPinCorrect={login} 
        attempts={pinAttempts}
        onIncrementAttempts={incrementPinAttempts}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6 fluid-fade-in">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 fluid-slide-in">
          <div className="text-center sm:text-left">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2 fluid-float ${isPrivate ? 'privacy-blur' : ''}`}>FaisyKoott</h1>
            <p className={`text-muted-foreground text-xs sm:text-sm lg:text-base ${isPrivate ? 'privacy-blur' : ''}`}>Manage your collections, payments, and accounts</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={openIntrusions}
              className="h-9 w-9"
              title="Show Captured Intrusions"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <PrivacyToggle isPrivate={isPrivate} onToggle={() => setIsPrivate(!isPrivate)} />
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="fluid-hover-button hover:bg-danger hover:text-danger-foreground h-8 w-8 sm:h-10 sm:w-10"
              title="Logout"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Financial Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-6 fluid-grid-item fluid-hover-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Profit</CardTitle>
              <IndianRupee className={`h-3 w-3 sm:h-4 sm:w-4 fluid-pulse ${analytics.profit >= 0 ? 'text-success' : 'text-danger'}`} />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${analytics.profit >= 0 ? 'text-success' : 'text-danger'} ${isPrivate ? 'privacy-blur' : ''}`}>
                {formatCurrency(analytics.profit)}
              </div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-6 fluid-grid-item fluid-hover-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Total Income</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold text-success ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.income)}</div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-6 sm:col-span-2 lg:col-span-1 fluid-grid-item fluid-hover-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Total Expense</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-danger fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold text-danger ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.expense)}</div>
            </CardContent>
          </Card>

          {/* Loss (shown when expenses exceed income) */}
          <Card className="p-3 sm:p-6 fluid-grid-item fluid-hover-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Loss</CardTitle>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-warning fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${analytics.loss > 0 ? 'text-warning' : 'text-muted-foreground'} ${isPrivate ? 'privacy-blur' : ''}`}>
                {formatCurrency(analytics.loss)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <Card className="p-2 sm:p-4 lg:p-6 fluid-grid-item fluid-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Expense Ratio</CardTitle>
              <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0 fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-warning ${isPrivate ? 'privacy-blur' : ''}`}>
                {`${analytics.expenseRatio.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6 fluid-grid-item fluid-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Profit Margin</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0 fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-primary ${isPrivate ? 'privacy-blur' : ''}`}>
                {`${analytics.profitMargin.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6 col-span-2 sm:col-span-1 fluid-grid-item fluid-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>To Collect</CardTitle>
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-info flex-shrink-0 fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-info ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.collect)}</div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6 fluid-grid-item fluid-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>To Pay</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-danger flex-shrink-0 fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-danger ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.pay)}</div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6 fluid-grid-item fluid-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Available Funds</CardTitle>
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0 fluid-pulse" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-primary ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.accounts)}</div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6 col-span-2 sm:col-span-1 fluid-grid-item fluid-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Net Balance</CardTitle>
              <IndianRupee className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 fluid-pulse ${(analytics.netCashAfterObligations) >= 0 ? 'text-success' : 'text-danger'}`} />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold ${(analytics.netCashAfterObligations) >= 0 ? 'text-success' : 'text-danger'} ${isPrivate ? 'privacy-blur' : ''}`}>
                {formatCurrency(analytics.netCashAfterObligations)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections & Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="fluid-grid-item">
            <CollectionsList
              items={data.collect}
              total={totals.collect}
              accounts={Object.entries(data.accounts).map(([key, account]) => ({
                id: account.id,
                name: account.name,
                type: account.type,
                amount: account.amount,
              }))}
              onAdd={addCollectItem}
              onUpdate={updateCollectItem}
              onDelete={deleteCollectItem}
              onMarkCompleted={markCollectItemAsCompleted}
              isPrivate={isPrivate}
            />
          </div>

          <div className="fluid-grid-item">
            <PaymentsList
              items={data.pay}
              total={totals.pay}
              accounts={Object.entries(data.accounts).map(([key, account]) => ({
                id: account.id,
                name: account.name,
                type: account.type,
                amount: account.amount,
              }))}
              onAdd={addPayItem}
              onUpdate={updatePayItem}
              onDelete={deletePayItem}
              onMarkCompleted={markPayItemAsCompleted}
              isPrivate={isPrivate}
            />
          </div>
        </div>

        {/* Income & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="fluid-grid-item">
            <IncomeList
              items={data.income}
              total={totals.income}
              categories={data.categories}
              accounts={Object.entries(data.accounts).map(([key, account]) => ({
                id: account.id,
                name: account.name,
                type: account.type,
                amount: account.amount,
              }))}
              onAdd={addIncomeItem}
              onUpdate={updateIncomeItem}
              onDelete={deleteIncomeItem}
              isPrivate={isPrivate}
              isLoading={operationLoading.addIncome || operationLoading.updateIncome || operationLoading.deleteIncome}
            />
          </div>

          <div className="fluid-grid-item">
            <ExpenseList
              items={data.expense}
              total={totals.expense}
              categories={data.categories}
              accounts={Object.entries(data.accounts).map(([key, account]) => ({
                id: account.id,
                name: account.name,
                type: account.type,
                amount: account.amount,
              }))}
              onAdd={addExpenseItem}
              onUpdate={updateExpenseItem}
              onDelete={deleteExpenseItem}
              isPrivate={isPrivate}
              isLoading={operationLoading.addExpense || operationLoading.updateExpense || operationLoading.deleteExpense}
            />
          </div>
        </div>

        {/* Categories Management */}
        <div className="mb-4 sm:mb-6 fluid-grid-item">
          <CategoryList
            categories={data.categories}
            onAdd={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            isPrivate={isPrivate}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="fluid-grid-item">
            <IncomeVsExpenseChart 
              totalIncome={totals.income} 
              totalExpense={totals.expense} 
              isPrivate={isPrivate} 
            />
          </div>
          
          <div className="fluid-grid-item">
            <ExpenseDistributionChart 
              expenses={data.expense} 
              categories={data.categories}
              isPrivate={isPrivate} 
            />
          </div>
        </div>

        {/* Accounts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <div className="fluid-grid-item">
            <AccountsOverview
              accounts={data.accounts}
              total={totals.accounts}
              onUpdate={updateAccount}
              onAdd={addAccount}
              onDelete={deleteAccount}
              isPrivate={isPrivate}
            />
          </div>

          <div className="fluid-grid-item">
            <AccountsChart accounts={data.accounts} isPrivate={isPrivate} />
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="mb-4 sm:mb-6 fluid-grid-item">
          <NotificationSettings />
        </div>
      </div>
      <Dialog open={intrusionsOpen} onOpenChange={setIntrusionsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Captured Intrusions</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {intrusions.map(item => (
              <div key={item.id} className="border rounded overflow-hidden">
                <div className="relative">
                  <AspectRatio ratio={4/3}>
                    <img
                      src={`${API_BASE}/intrusions/${item.photo_path}`}
                      alt={`Intrusion ${item.id}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AspectRatio>
                  <button
                    onClick={() => requestDelete(item.id)}
                    className="absolute top-1 right-1 bg-background/70 hover:bg-background text-foreground rounded-full p-1 shadow"
                    title="Delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-[10px] sm:text-xs p-2 space-y-1">
                  <div className="break-all"><span className="font-semibold">IP:</span> {item.ip || 'unknown'}</div>
                  <div className="break-words whitespace-pre-wrap"><span className="font-semibold">UA:</span> {item.user_agent || ''}</div>
                  <div><span className="font-semibold">At:</span> {new Date(item.created_at + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                  {item.meta && (() => { try { const m = JSON.parse(item.meta); return (
                    <div className="space-y-0.5">
                      {m.platform && <div><span className="font-semibold">Platform:</span> {m.platform}</div>}
                      {m.language && <div><span className="font-semibold">Lang:</span> {m.language}</div>}
                      {m.vendor && <div><span className="font-semibold">Vendor:</span> {m.vendor}</div>}
                    </div>
                  ); } catch { return null; } })()}
                </div>
              </div>
            ))}
            {intrusions.length === 0 && (
              <div className="text-sm text-muted-foreground">No captures yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{pinMode === 'delete' ? 'Enter PIN to delete' : 'Enter PIN to view captures'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              inputMode="numeric"
              value={pinValue}
              onChange={(e) => { setPinValue(e.target.value); setPinError(''); }}
              placeholder="Enter PIN"
              autoFocus
            />
            {pinError && <div className="text-sm text-destructive">{pinError}</div>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPinDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmDeleteWithPin}>{pinMode === 'delete' ? 'Delete' : 'Submit'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
