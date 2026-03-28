// @ts-nocheck
import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  Wallet, 
  TrendingDown, 
  MessageSquare, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Plus, 
  Send,
  Clock,
  AlertCircle,
  User,
  LogOut,
  LogIn,
  Camera,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Euro,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  History,
  Receipt,
  Trash2,
  Check
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { processExpense, getAntiImpulseResponse, processReceiptImage } from './services/gemini';
import { cn } from './lib/utils';
// Languages
type Language = 'it' | 'en';

const translations = {
  it: {
    welcome: 'Benvenuto in LuxeVault AI. Come posso aiutarti a gestire il tuo patrimonio oggi?',
    analyzing_receipt: 'Sto analizzando lo scontrino...',
    receipt_error: 'Non sono riuscito a leggere lo scontrino. Assicurati che l\'immagine sia chiara.',
    receipt_of: 'del',
    receipt_uploaded: 'Ho analizzato lo scontrino',
    items_loaded: 'Caricati {count} articoli nel tuo Vault.',
    items_skipped: '{count} articoli saltati: Inserisci un importo valido.',
    budget_warning: 'Attenzione: {count} articoli superano il tuo budget giornaliero ({budget}€). Desideri aggiungerli comunque?',
    confirm_add: 'Conferma e aggiungi',
    cancel: 'Annulla',
    analysis_error: 'Errore durante l\'analisi dello scontrino.',
    invalid_email: 'Inserisci un indirizzo email valido.',
    welcome_vault: 'Benvenuto nel Vault!',
    session_closed: 'Sessione chiusa.',
    salary_set: 'Stipendio impostato a {value}€.',
    budget_set: 'Budget giornaliero impostato a {value}€.',
    budget_exceeded: 'Budget giornaliero superato!',
    today_total: 'Spesa totale odierna: {total}€ (Limite: {limit}€).',
    budget_attention: 'Attenzione al budget!',
    budget_percent: 'Sei al {percent}% del tuo budget giornaliero ({budget}€).',
    high_expense: 'Spesa elevata rilevata!',
    high_expense_desc: 'Questa spesa da {amount}€ rappresenta il {percent}% del tuo budget giornaliero.',
    set_salary_first: 'Per favore, imposta prima il tuo stipendio nel profilo per usare questa funzione.',
    invalid_amount: 'Per favore, inserisci un importo valido per poter registrare la spesa.',
    expense_recorded: 'Spesa registrata',
    login_title: 'LUXEVAULT AI',
    login_subtitle: 'Gestione patrimoniale d\'élite.',
    email_placeholder: 'La tua email',
    enter_vault: 'Entra nel Vault',
    vault_encrypted: 'Il Vault è crittografato localmente.',
    logout: 'Esci',
    profile: 'Profilo',
    add: 'Aggiungi',
    email: 'Email',
    monthly_salary: 'Stipendio Mensile',
    daily_budget: 'Budget Giornaliero',
    delete_salary: 'Elimina Stipendio',
    confirm_salary: 'Conferma Stipendio',
    delete_budget: 'Elimina Budget',
    confirm_budget: 'Conferma Budget',
    ai_assistant: 'AI Assistant',
    ask: 'Chiedi...',
    scan: 'Scansiona',
    today: 'Oggi',
    total_expenses: 'Totale Spese',
    cat_distribution: 'Ripartizione Categorie',
    daily_expenses: 'Spese Giornaliere',
    expense_history: 'Storico Spese',
    purchase: 'Acquisto',
    registration: 'Registrazione',
    category: 'Categoria',
    no_expenses: 'Nessuna spesa registrata per questo periodo.',
    hour_short: 'ore',
    registered: 'Registrato',
    delete_expense: 'Elimina spesa',
    prev_month: 'Mese precedente',
    choose_month: 'Scegli mese',
    next_month: 'Mese successivo',
    back_today: 'Torna a Oggi',
    something_went_wrong: 'Qualcosa è andato storto.',
    error_occurred: 'Ops! Si è verificato un errore',
    reload_app: 'Ricarica App',
    categories: {
      'Cibo': 'Cibo',
      'Trasporti': 'Trasporti',
      'Shopping': 'Shopping',
      'Salute': 'Salute',
      'Svago': 'Svago',
      'Casa': 'Casa',
      'Altro': 'Altro',
      'Generale': 'Generale'
    }
  },
  en: {
    welcome: 'Welcome to LuxeVault AI. How can I help you manage your wealth today?',
    analyzing_receipt: 'Analyzing receipt...',
    receipt_error: 'Could not read the receipt. Make sure the image is clear.',
    receipt_of: 'from',
    receipt_uploaded: 'I analyzed the receipt',
    items_loaded: 'Loaded {count} items into your Vault.',
    items_skipped: '{count} items skipped: Enter a valid amount.',
    budget_warning: 'Warning: {count} items exceed your daily budget ({budget}€). Do you want to add them anyway?',
    confirm_add: 'Confirm and Add',
    cancel: 'Cancel',
    analysis_error: 'Error during receipt analysis.',
    invalid_email: 'Please enter a valid email address.',
    welcome_vault: 'Welcome to the Vault!',
    session_closed: 'Session closed.',
    salary_set: 'Salary set to {value}€.',
    budget_set: 'Daily budget set to {value}€.',
    budget_exceeded: 'Daily budget exceeded!',
    today_total: 'Today\'s total spending: {total}€ (Limit: {limit}€).',
    budget_attention: 'Watch your budget!',
    budget_percent: 'You are at {percent}% of your daily budget ({budget}€).',
    high_expense: 'High expense detected!',
    high_expense_desc: 'This expense of {amount}€ represents {percent}% of your daily budget.',
    set_salary_first: 'Please set your salary in your profile first to use this feature.',
    invalid_amount: 'Please enter a valid amount to record the expense.',
    expense_recorded: 'Expense recorded',
    login_title: 'LUXEVAULT AI',
    login_subtitle: 'Elite wealth management.',
    email_placeholder: 'Your email',
    enter_vault: 'Enter the Vault',
    vault_encrypted: 'The Vault is locally encrypted.',
    logout: 'Logout',
    profile: 'Profile',
    add: 'Add',
    email: 'Email',
    monthly_salary: 'Monthly Salary',
    daily_budget: 'Daily Budget',
    delete_salary: 'Delete Salary',
    confirm_salary: 'Confirm Salary',
    delete_budget: 'Delete Budget',
    confirm_budget: 'Confirm Budget',
    ai_assistant: 'AI Assistant',
    ask: 'Ask...',
    scan: 'Scan',
    today: 'Today',
    total_expenses: 'Total Expenses',
    cat_distribution: 'Category Distribution',
    daily_expenses: 'Daily Expenses',
    expense_history: 'Expense History',
    purchase: 'Purchase',
    registration: 'Registration',
    category: 'Category',
    no_expenses: 'No expenses recorded for this period.',
    hour_short: 'hours',
    registered: 'Registered',
    delete_expense: 'Delete expense',
    prev_month: 'Previous month',
    choose_month: 'Choose month',
    next_month: 'Next month',
    back_today: 'Back to Today',
    something_went_wrong: 'Something went wrong.',
    error_occurred: 'Oops! An error occurred',
    reload_app: 'Reload App',
    categories: {
      'Food': 'Food',
      'Transport': 'Transport',
      'Shopping': 'Shopping',
      'Health': 'Health',
      'Leisure': 'Leisure',
      'Home': 'Home',
      'Other': 'Other',
      'General': 'General'
    }
  }
};

// Types
interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  created_at: any;
  registered_at?: any;
  has_time?: boolean;
}

interface Profile {
  id: string;
  email: string;
  salary: number;
  daily_budget?: number;
}

interface MessageAction {
  label: string;
  type: 'confirm_expense' | 'cancel';
  payload: any;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  type?: 'expense' | 'impulse' | 'info' | 'warning';
  actions?: MessageAction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Cibo': '#A8E6CF',      // Mint Green
  'Trasporti': '#A2D2FF',  // Sky Blue
  'Shopping': '#FFD1DC',   // Soft Pink
  'Salute': '#FF9AA2',    // Soft Coral
  'Svago': '#C5A3FF',      // Soft Lavender
  'Casa': '#FFDAC1',       // Soft Peach
  'Altro': '#E2F0CB',      // Soft Lime
  'Generale': '#FFFFD1',   // Soft Yellow
};

const DEFAULT_COLOR = '#FFFFD1';
const COLORS = Object.values(CATEGORY_COLORS);

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// @ts-ignore
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = t('something_went_wrong');
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error) {
          errorMessage = `Errore di sistema: ${parsedError.error}`;
        }
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-luxury-bg p-4 text-center">
          <div className="luxury-card p-8 max-w-md w-full gold-border">
            <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-luxury-gold mb-2">{t('error_occurred')}</h2>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-luxury-gold text-luxury-bg font-bold rounded-lg"
            >
              {t('reload_app')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function LuxeVaultApp() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('luxevault_language');
    return (saved as Language) || 'it';
  });

  const t = (key: string, params: Record<string, any> = {}) => {
    let text = translations[language][key] || key;
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
    return text;
  };

  useEffect(() => {
    localStorage.setItem('luxevault_language', language);
  }, [language]);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t('welcome'), sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [salaryInput, setSalaryInput] = useState(0);
  const [dailyBudgetInput, setDailyBudgetInput] = useState(0);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [sortType, setSortType] = useState<'purchase' | 'registration' | 'category'>('purchase');
  const [showEmail, setShowEmail] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [emailInputLogin, setEmailInputLogin] = useState(''); // New state for login email
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const historyDateInputRef = useRef<HTMLInputElement>(null);
  const barChartContainerRef = useRef<HTMLDivElement>(null);

  const filteredExpenses = expenses
    .filter(e => {
      const d = new Date(e.created_at);
      return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
    })
    .sort((a, b) => {
      if (sortType === 'registration') {
        const dateA = new Date(a.registered_at || a.created_at);
        const dateB = new Date(b.registered_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      } else if (sortType === 'category') {
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      } else {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      }
    });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    setMessages(prev => [...prev, { id: Date.now().toString(), text: t('analyzing_receipt'), sender: 'ai', type: 'info' }]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;

        const { date, time, items } = await processReceiptImage(base64String, mimeType);

        if (items.length === 0) {
          setMessages(prev => [...prev, { id: Date.now().toString(), text: t('receipt_error'), sender: 'ai' }]);
        } else {
          let successCount = 0;
          let pendingItems = [];
          let dateObj = new Date();
          const hasTime = !!date && !!time;

          if (date) {
            try {
              const [y, m, d] = date.split('-').map(Number);
              const tempDate = new Date(y, m - 1, d);
              
              if (time) {
                const [h, min] = time.split(':').map(Number);
                tempDate.setHours(h, min);
              }

              if (!isNaN(tempDate.getTime())) {
                dateObj = tempDate;
              }
            } catch (e) {
              console.error("Receipt date parsing error:", e);
            }
          }

          let currentRunningTotal = getTodayTotal(dateObj);
          const newExpenses = [...expenses];
          let missingAmountCount = 0;

          for (const exp of items) {
            if (!exp.amount || exp.amount <= 0) {
              missingAmountCount++;
              continue;
            }
            
            const expenseData = {
              user_id: user.uid,
              amount: exp.amount,
              category: exp.category,
              description: exp.description,
              created_at: dateObj.toISOString(),
              has_time: hasTime
            };

            if (wouldExceedBudget(exp.amount, dateObj, currentRunningTotal)) {
              pendingItems.push(expenseData);
            } else {
              const newExp = {
                ...expenseData,
                id: Math.random().toString(36).substr(2, 9),
                registered_at: new Date().toISOString()
              };
              newExpenses.unshift(newExp);
              checkBudgetNotification(exp.amount, dateObj, newExpenses);
              successCount++;
              currentRunningTotal += exp.amount;
            }
          }

          if (successCount > 0) {
            setExpenses(newExpenses);
            localStorage.setItem(`luxevault_expenses_${user.uid}`, JSON.stringify(newExpenses));
          }

          let responseText = `${t('receipt_uploaded')}${date ? ` ${t('receipt_of')} ${dateObj.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}` : ''}.`;
          if (successCount > 0) {
            responseText += ` ${t('items_loaded', { count: successCount })}`;
          }
          if (missingAmountCount > 0) {
            responseText += `\n\n⚠️ ${t('items_skipped', { count: missingAmountCount })}`;
          }
          
          let actions: MessageAction[] = [];
          if (pendingItems.length > 0) {
            responseText += `\n\n⚠️ ${t('budget_warning', { count: pendingItems.length, budget: profile?.daily_budget })}`;
            actions = [
              { label: t('confirm_add'), type: 'confirm_expense', payload: { expenses: pendingItems } },
              { label: t('cancel'), type: 'cancel', payload: {} }
            ];
          }

          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: responseText, 
            sender: 'ai',
            type: pendingItems.length > 0 ? 'warning' : 'expense',
            actions: actions.length > 0 ? actions : undefined
          }]);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Errore durante l'analisi dello scontrino.", sender: 'ai' }]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // TEMPORARY: Disabled Firebase Auth Listener
    /*
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
    */

    // NEW: Local Mock Auth
    const savedUser = localStorage.getItem('luxevault_mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      // Load Profile from LocalStorage
      const profileKey = `luxevault_profile_${user.uid}`;
      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        const data = JSON.parse(savedProfile);
        setProfile(data);
        if (data.salary) setSalaryInput(data.salary);
        if (data.daily_budget) setDailyBudgetInput(data.daily_budget);
      } else {
        const initialProfile = { id: user.uid, email: user.email || '', salary: 0 };
        setProfile(initialProfile);
        localStorage.setItem(profileKey, JSON.stringify(initialProfile));
      }

      // Load Expenses from LocalStorage
      const expensesKey = `luxevault_expenses_${user.uid}`;
      const savedExpenses = localStorage.getItem(expensesKey);
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      } else {
        setExpenses([]);
      }
    }
  }, [user, isAuthReady]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = async () => {
    // TEMPORARY: Disabled Firebase Popup
    /*
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
    */

    // NEW: Local Email Login
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInputLogin.trim())) {
      toast.error(t('invalid_email'));
      return;
    }

    const mockUser = {
      uid: btoa(emailInputLogin.trim()).replace(/=/g, ""),
      email: emailInputLogin.trim(),
      displayName: emailInputLogin.trim().split('@')[0],
      photoURL: null
    };

    setUser(mockUser);
    localStorage.setItem('luxevault_mock_user', JSON.stringify(mockUser));
    toast.success(t('welcome_vault'));
  };

  const handleLogout = async () => {
    // TEMPORARY: Disabled Firebase SignOut
    /*
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
    */

    // NEW: Local Logout
    setUser(null);
    setExpenses([]);
    setProfile(null);
    setMessages([
      { id: '1', text: t('welcome'), sender: 'ai' }
    ]);
    setSalaryInput(0);
    setDailyBudgetInput(0);
    localStorage.removeItem('luxevault_mock_user');
    toast.info(t('session_closed'));
  };

  const handleSetSalary = async (value: number) => {
    if (!user) return;

    setProfile(prev => {
      const newProfile = prev ? { ...prev, salary: value } : { id: user.uid, email: user.email || '', salary: value };
      localStorage.setItem(`luxevault_profile_${user.uid}`, JSON.stringify(newProfile));
      return newProfile;
    });
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      text: t('salary_set', { value }), 
      sender: 'ai' 
    }]);
  };

  const handleSetDailyBudget = async (value: number) => {
    if (!user) return;

    setProfile(prev => {
      const newProfile = prev ? { ...prev, daily_budget: value } : { id: user.uid, email: user.email || '', salary: salaryInput, daily_budget: value };
      localStorage.setItem(`luxevault_profile_${user.uid}`, JSON.stringify(newProfile));
      return newProfile;
    });
    
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      text: t('budget_set', { value }), 
      sender: 'ai' 
    }]);
  };

  const getTodayTotal = (date: Date) => {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return expenses.filter(e => {
      const d = new Date(e.created_at);
      return d >= today && d < tomorrow;
    }).reduce((sum, e) => sum + e.amount, 0);
  };

  const wouldExceedBudget = (amount: number, date: Date, currentRunningTotal?: number) => {
    if (!profile?.daily_budget) return false;
    
    const budget = profile.daily_budget;
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();

    if (!isToday) return false;

    const currentTotal = currentRunningTotal !== undefined ? currentRunningTotal : getTodayTotal(date);
    return (currentTotal + amount) > budget;
  };

  const handleMessageAction = async (action: MessageAction, messageId: string) => {
    if (action.type === 'confirm_expense') {
      try {
        const { expenses: expsToConfirm } = action.payload;
        const newExpenses = [...expenses];
        
        for (const exp of expsToConfirm) {
          const newExp = {
            ...exp,
            id: Math.random().toString(36).substr(2, 9),
            registered_at: new Date().toISOString()
          };
          newExpenses.unshift(newExp);
        }
        
        setExpenses(newExpenses);
        localStorage.setItem(`luxevault_expenses_${user.uid}`, JSON.stringify(newExpenses));

        // Trigger notifications for confirmed expenses
        for (const exp of expsToConfirm) {
          checkBudgetNotification(exp.amount, new Date(exp.created_at), newExpenses);
        }

        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, actions: [], text: m.text + "\n\n✅ Spese confermate e aggiunte al Vault." } : m
        ));
        
        toast.success("Spese aggiunte con successo!");
      } catch (err) {
        console.error("Error confirming expenses:", err);
        toast.error("Errore durante la conferma delle spese.");
      }
    } else if (action.type === 'cancel') {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, actions: [], text: m.text + "\n\n❌ Operazione annullata." } : m
      ));
    }
  };

  const checkBudgetNotification = (amount: number, date: Date, currentExpenses?: Expense[]) => {
    if (!profile?.daily_budget) return;

    const budget = profile.daily_budget;
    const threshold = budget * 0.5; // Single expense threshold: 50% of daily budget
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear();

    if (isToday) {
      const expensesList = currentExpenses || expenses;
      const todayTotal = expensesList
        .filter(e => {
          const d = new Date(e.created_at);
          return d.getDate() === today.getDate() && 
                 d.getMonth() === today.getMonth() && 
                 d.getFullYear() === today.getFullYear();
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const alreadyIncludesThisAmount = currentExpenses !== undefined;
      const finalTotal = alreadyIncludesThisAmount ? todayTotal : (todayTotal + amount);
      
      if (finalTotal > budget) {
        toast.error(t('budget_exceeded'), {
          description: t('today_total', { total: (finalTotal || 0).toFixed(2), limit: budget }),
          duration: 6000,
        });
        return; 
      } else if (finalTotal >= budget * 0.8) {
        toast.info(t('budget_attention'), {
          description: t('budget_percent', { percent: Math.round((finalTotal / budget) * 100), budget }),
          duration: 5000,
        });
        return; 
      }
    }

    if (amount >= threshold) {
      const percent = Math.round((amount / budget) * 100);
      toast.warning(t('high_expense'), {
        description: t('high_expense_desc', { amount, percent }),
        duration: 5000,
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    const newExpenses = expenses.filter(e => e.id !== id);
    setExpenses(newExpenses);
    localStorage.setItem(`luxevault_expenses_${user.uid}`, JSON.stringify(newExpenses));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMessage, sender: 'user' }]);
    setIsProcessing(true);

    try {
      const impulseMatch = userMessage.match(/(\d+(?:[.,]\d+)?)\s*€/i);
      
        if (userMessage.toLowerCase().includes('comprare') && impulseMatch) {
          const price = parseFloat(impulseMatch[1].replace(',', '.'));
          if (profile?.salary) {
            const hourlyWage = profile.salary / 160; // Assume 160h/month
            const categoryTotals = expenses.reduce((acc, curr) => {
              acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
              return acc;
            }, {} as Record<string, number>);
            
            const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Generale';
            const topAmount = categoryTotals[topCategory] || 0;
  
            const aiResponse = await getAntiImpulseResponse(price, hourlyWage, topCategory, topAmount, language);
            setMessages(prev => [...prev, { id: Date.now().toString(), text: aiResponse, sender: 'ai', type: 'impulse' }]);
          } else {
            setMessages(prev => [...prev, { id: Date.now().toString(), text: t('set_salary_first'), sender: 'ai' }]);
          }
        } else {
        const expenseData = await processExpense(userMessage, language);
        
        if (!expenseData.amount || expenseData.amount <= 0) {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: t('invalid_amount'), 
            sender: 'ai' 
          }]);
          setIsProcessing(false);
          return;
        }

        let dateObj = new Date();
        const hasTime = !!expenseData.time;

        if (expenseData.date) {
          try {
            const [y, m, d] = expenseData.date.split('-').map(Number);
            const tempDate = new Date(y, m - 1, d);
            
            if (expenseData.time) {
              const [h, min] = expenseData.time.split(':').map(Number);
              tempDate.setHours(h, min);
            }

            if (!isNaN(tempDate.getTime())) {
              dateObj = tempDate;
            }
          } catch (e) {
            console.error("Date parsing error:", e);
          }
        }
        
        const expenseToSave = {
          user_id: user.uid,
          amount: expenseData.amount,
          category: expenseData.category,
          description: expenseData.description,
          created_at: dateObj.toISOString(),
          has_time: hasTime
        };

        const currentTotal = getTodayTotal(dateObj);
        if (wouldExceedBudget(expenseData.amount, dateObj, currentTotal)) {
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: `⚠️ Attenzione: questa spesa di ${expenseData.amount}€ supera il tuo budget giornaliero (${profile?.daily_budget}€). Desideri aggiungerla comunque?`, 
            sender: 'ai',
            type: 'warning',
            actions: [
              { label: "Conferma e aggiungi", type: 'confirm_expense', payload: { expenses: [expenseToSave] } },
              { label: "Annulla", type: 'cancel', payload: {} }
            ]
          }]);
        } else {
          const newExp = {
            ...expenseToSave,
            id: Math.random().toString(36).substr(2, 9),
            registered_at: new Date().toISOString()
          };
          const newExpenses = [newExp, ...expenses];
          setExpenses(newExpenses);
          localStorage.setItem(`luxevault_expenses_${user.uid}`, JSON.stringify(newExpenses));

          checkBudgetNotification(expenseData.amount, dateObj, newExpenses);

          const dateDisplay = expenseData.date ? ` ${t('receipt_of')} ${dateObj.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: hasTime ? '2-digit' : undefined, minute: hasTime ? '2-digit' : undefined })}` : '';
          setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: `${t('expense_recorded')}${dateDisplay}: ${expenseData.amount}€ per ${expenseData.description} (${expenseData.category}).`, 
            sender: 'ai',
            type: 'expense'
          }]);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: t('something_went_wrong'), sender: 'ai' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const chartData = filteredExpenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string, value: number }[]);

  const barData = (() => {
    const daysMap = new Map();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Get total days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    days.forEach(date => {
      const dateKey = date.toLocaleDateString();
      const dateStr = date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
      const dYear = date.getFullYear();
      const currentYear = new Date().getFullYear();
      const name = dYear !== currentYear ? `${dateStr} '${dYear.toString().slice(-2)}` : dateStr;
      
      daysMap.set(dateKey, { name, isDifferentYear: dYear !== currentYear });
    });

    expenses.forEach(e => {
      const eDate = new Date(e.created_at);
      eDate.setHours(0, 0, 0, 0);
      const dateKey = eDate.toLocaleDateString();
      
      if (daysMap.has(dateKey)) {
        const dayObj = daysMap.get(dateKey);
        dayObj[e.category] = (dayObj[e.category] || 0) + e.amount;
      }
    });

    return Array.from(daysMap.values());
  })();

  useEffect(() => {
    if (barChartContainerRef.current) {
      barChartContainerRef.current.scrollLeft = barChartContainerRef.current.scrollWidth;
    }
  }, [barData]);

  const activeCategories = Array.from(new Set(filteredExpenses.map(e => e.category)));

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-bg">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-bg p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="luxury-card p-8 max-w-md w-full text-center space-y-6 gold-border gold-glow"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-luxury-gold flex items-center justify-center">
              <Wallet className="text-luxury-bg w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-luxury-gold tracking-tighter">{t('login_title')}</h1>
          <p className="text-gray-400">{t('login_subtitle')}</p>
          
          <div className="space-y-4 pt-4">
            <div className="relative group">
              <input
                type="email"
                placeholder={t('email_placeholder')}
                value={emailInputLogin}
                onChange={(e) => setEmailInputLogin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-black/50 border border-luxury-gold/20 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-luxury-gold transition-all"
              />
            </div>
            <button 
              onClick={handleLogin}
              className="w-full py-3 bg-luxury-gold text-luxury-bg font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              <LogIn size={20} /> {t('enter_vault')}
            </button>
          </div>
          
          <p className="text-[10px] text-gray-600 uppercase tracking-widest pt-2">
            {t('vault_encrypted')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-bg text-white flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar / Profile & Chat */}
      <aside className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-luxury-gold/20 p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 h-auto lg:h-screen lg:overflow-hidden bg-black/20 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-luxury-gold flex items-center justify-center">
              <Wallet className="text-luxury-bg w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-luxury-gold tracking-tighter">LUXEVAULT</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap"
          >
            <LogOut size={12} /> {t('logout')}
          </button>
        </div>

        <div className="luxury-card p-4 space-y-4 shrink-0">
          <div className="flex items-center justify-between text-luxury-gold">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-5 h-5 rounded-full border border-luxury-gold/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User size={18} />
              )}
              <span className="text-sm font-medium uppercase tracking-widest">{t('profile')}</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <div className="flex items-center bg-white/5 border border-luxury-gold/20 rounded-lg p-0.5 mr-1">
                <button 
                  onClick={() => setLanguage('it')}
                  className={cn(
                    "px-1.5 py-1 text-[8px] font-bold rounded transition-all",
                    language === 'it' 
                      ? "bg-luxury-gold text-luxury-bg shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                      : "text-luxury-gold/50 hover:text-luxury-gold"
                  )}
                >
                  IT
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-1.5 py-1 text-[8px] font-bold rounded transition-all",
                    language === 'en' 
                      ? "bg-luxury-gold text-luxury-bg shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                      : "text-luxury-gold/50 hover:text-luxury-gold"
                  )}
                >
                  EN
                </button>
              </div>
              
              <button 
                onClick={() => setIsSalaryOpen(!isSalaryOpen)}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all border flex items-center gap-2",
                  isSalaryOpen 
                    ? "bg-luxury-gold text-luxury-bg border-luxury-gold" 
                    : "bg-white/5 text-luxury-gold border-luxury-gold/20 hover:bg-luxury-gold/10"
                )}
              >
                <Plus size={14} className={cn("transition-transform", isSalaryOpen && "rotate-45")} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{t('add')}</span>
              </button>
              <button 
                onClick={() => setShowEmail(!showEmail)}
                className="p-1.5 bg-white/5 text-luxury-gold border border-luxury-gold/20 rounded-lg hover:bg-luxury-gold/10 transition-all"
              >
                {showEmail ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{t('email')}</p>
            <p className={cn(
              "text-sm truncate font-mono transition-all duration-500",
              !showEmail && "blur-sm select-none opacity-40"
            )}>
              {user.email}
            </p>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {isSalaryOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-2"
                >
                  <div className="bg-black/40 border border-luxury-gold/20 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">{t('monthly_salary')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-luxury-gold font-mono">{salaryInput}€</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            handleSetSalary(0);
                            setSalaryInput(0);
                          }}
                          className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title={t('delete_salary')}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            handleSetSalary(salaryInput);
                            setIsSalaryOpen(false);
                          }}
                          className="p-2 bg-green-500/20 text-green-500 border border-green-500/30 rounded-lg hover:bg-green-500 hover:text-white transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                          title={t('confirm_salary')}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative h-6 flex items-center">
                      <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-luxury-gold/20 to-luxury-gold" 
                          style={{ width: `${(salaryInput / 10000) * 100}%` }}
                        />
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10000" 
                        step="50"
                        value={salaryInput}
                        onChange={(e) => setSalaryInput(parseInt(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="absolute w-4 h-4 bg-luxury-gold rounded-full border-2 border-luxury-bg shadow-[0_0_10px_rgba(212,175,55,0.5)] pointer-events-none"
                        style={{ left: `calc(${(salaryInput / 10000) * 100}% - 8px)` }}
                      />
                    </div>

                    <div className="flex justify-between text-[8px] text-gray-600 font-mono">
                      <span>0€</span>
                      <span>5.000€</span>
                      <span>10.000€</span>
                    </div>

                    <div className="h-px bg-luxury-gold/10 my-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest">{t('daily_budget')}</span>
                        <span className="text-lg font-bold text-luxury-gold font-mono">{dailyBudgetInput}€</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            handleSetDailyBudget(0);
                            setDailyBudgetInput(0);
                          }}
                          className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title={t('delete_budget')}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            handleSetDailyBudget(dailyBudgetInput);
                            setIsSalaryOpen(false);
                          }}
                          className="p-2 bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          title={t('confirm_budget')}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative h-6 flex items-center">
                      <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500/20 to-blue-500" 
                          style={{ width: `${(dailyBudgetInput / 500) * 100}%` }}
                        />
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="500" 
                        step="10"
                        value={dailyBudgetInput}
                        onChange={(e) => setDailyBudgetInput(parseInt(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div 
                        className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-luxury-bg shadow-[0_0_10px_rgba(59,130,246,0.5)] pointer-events-none"
                        style={{ left: `calc(${(dailyBudgetInput / 500) * 100}% - 8px)` }}
                      />
                    </div>

                    <div className="flex justify-between text-[8px] text-gray-600 font-mono">
                      <span>0€</span>
                      <span>250€</span>
                      <span>500€</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Interface moved to Sidebar */}
        <div className="luxury-card flex flex-col flex-1 min-h-[400px] lg:min-h-0 border-luxury-gold/30 gold-glow overflow-hidden">
          <div className="p-3 border-b border-luxury-gold/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-luxury-gold" />
              <span className="text-[10px] font-medium uppercase tracking-widest">{t('ai_assistant')}</span>
            </div>
            {isProcessing && (
              <div className="flex gap-1">
                <span className="w-1 h-1 bg-luxury-gold rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-luxury-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 bg-luxury-gold rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: m.sender === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "max-w-[90%] p-2.5 rounded-xl text-xs",
                    m.sender === 'user' 
                      ? "ml-auto bg-luxury-gold text-luxury-bg font-medium" 
                      : "mr-auto bg-white/5 border border-white/10 text-gray-200",
                    m.type === 'impulse' && "border-red-500/50 bg-red-500/5",
                    m.type === 'expense' && "border-green-500/50 bg-green-500/5"
                  )}
                >
                  {m.text}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleMessageAction(action, m.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                            action.type === 'confirm_expense' 
                              ? "bg-luxury-gold text-luxury-bg hover:bg-white" 
                              : "bg-white/10 text-gray-400 hover:bg-white/20"
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-luxury-gold/10 shrink-0">
            <div className="relative flex items-center gap-2">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('ask')}
                  className="w-full bg-black/50 border border-luxury-gold/20 rounded-full py-2 pl-3 pr-10 text-xs focus:outline-none focus:border-luxury-gold transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isProcessing}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-luxury-gold hover:text-white transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="p-2 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg transition-all disabled:opacity-50"
                title={t('scan')}
              >
                <Camera size={16} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleReceiptUpload}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-auto lg:h-screen lg:overflow-hidden">
        {/* Header Stats */}
        <header className="p-4 lg:p-6 border-b border-luxury-gold/10 flex flex-col gap-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1 bg-black/40 border border-luxury-gold/20 rounded-lg p-1 shrink-0">
                <button 
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                  className="p-1.5 hover:bg-luxury-gold/10 text-luxury-gold rounded transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <div 
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="px-2 sm:px-4 flex items-center gap-2 min-w-[120px] sm:min-w-[140px] justify-center cursor-pointer hover:bg-luxury-gold/5 rounded transition-colors relative"
                >
                  <CalendarIcon size={12} className="text-luxury-gold/50" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-luxury-gold whitespace-nowrap">
                    {viewDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                  </span>
                  <input 
                    type="month" 
                    ref={dateInputRef}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month] = e.target.value.split('-');
                        setViewDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                  className="p-1.5 hover:bg-luxury-gold/10 text-luxury-gold rounded transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button 
                onClick={() => setViewDate(new Date())}
                className="px-4 py-1.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-[10px] uppercase tracking-widest text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg font-bold transition-all shadow-sm shrink-0"
              >
                {t('today')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 lg:gap-6 justify-center items-center">
            <motion.div 
              layout
              className="luxury-card p-4 w-[200px] sm:w-[260px] transition-all shrink-0 text-center"
            >
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase mb-1 tracking-tighter">{t('total_expenses')} {viewDate.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' }).toUpperCase()}</p>
              <p className="text-xl sm:text-2xl font-bold text-luxury-gold">
                {(totalExpenses || 0).toFixed(2)}€
              </p>
            </motion.div>
            
            <motion.div 
              layout
              className="luxury-card p-4 w-[200px] sm:w-[260px] relative group transition-all shrink-0 text-center"
            >
              <div className="relative mb-1 flex items-center justify-center">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-tighter">{t('monthly_salary')}</p>
                <button 
                  onClick={() => setShowSalary(!showSalary)}
                  className="absolute -right-1 top-1/2 -translate-y-1/2 p-1 text-luxury-gold/50 hover:text-luxury-gold transition-colors"
                >
                  {showSalary ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <p className={`text-xl sm:text-2xl font-bold text-luxury-gold font-mono transition-all duration-500 ${!showSalary && profile?.salary > 0 ? 'blur-md select-none opacity-40' : ''}`}>
                {profile?.salary > 0 
                  ? `${Math.round(profile.salary)}€`
                  : '-'
                }
              </p>
            </motion.div>

            <motion.div 
              layout
              className="luxury-card p-4 w-[200px] sm:w-[260px] relative group transition-all shrink-0 text-center"
            >
              <div className="relative mb-1 flex items-center justify-center">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-tighter">{t('daily_budget')}</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-luxury-gold font-mono">
                {profile?.daily_budget && profile.daily_budget > 0 
                  ? `${profile.daily_budget}€`
                  : '-'
                }
              </p>
            </motion.div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Charts */}
          <div className="luxury-card p-6 h-[400px]">
            <h3 className="text-sm font-medium uppercase tracking-widest text-luxury-gold mb-4 flex items-center gap-2">
              <PieChartIcon size={16} /> {t('cat_distribution')}
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="70%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #d4af37' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="luxury-card p-6 h-[400px] flex flex-col">
            <h3 className="text-sm font-medium uppercase tracking-widest text-luxury-gold mb-4 flex items-center gap-2 shrink-0">
              <BarChart3 size={16} /> {t('daily_expenses')} ({viewDate.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' })})
            </h3>
            <div ref={barChartContainerRef} className="flex-1 overflow-x-auto custom-scrollbar relative">
              <div style={{ minWidth: `${Math.max(barData.length * 45, 300)}px`, height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isDiff = barData.find(d => d.name === payload.value)?.isDifferentYear;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text 
                              x={0} 
                              y={0} 
                              dy={16} 
                              textAnchor="middle" 
                              fill={isDiff ? "#d4af37" : "#666"}
                              fontWeight={isDiff ? "bold" : "normal"}
                              fontSize={9}
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #d4af37', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    {activeCategories.map((cat) => (
                      <Bar 
                        key={cat} 
                        dataKey={cat} 
                        stackId="a" 
                        fill={CATEGORY_COLORS[cat] || DEFAULT_COLOR} 
                        radius={[2, 2, 0, 0]} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
              {activeCategories.map((cat) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: CATEGORY_COLORS[cat] || DEFAULT_COLOR }}
                  />
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense History */}
          <div className="luxury-card p-6 lg:col-span-2 max-h-[600px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
              <h3 className="text-sm font-medium uppercase tracking-widest text-luxury-gold flex items-center gap-2">
                <History size={16} /> {t('expense_history')} ({viewDate.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' })})
              </h3>
              <div className="flex items-center gap-2 bg-black/40 border border-luxury-gold/20 rounded-lg p-1">
                <button 
                  onClick={() => setSortType('purchase')}
                  className={cn("px-2 py-1 text-[8px] uppercase tracking-widest rounded transition-all", sortType === 'purchase' ? "bg-luxury-gold text-luxury-bg font-bold" : "text-gray-500 hover:text-luxury-gold")}
                >
                  {t('purchase')}
                </button>
                <button 
                  onClick={() => setSortType('registration')}
                  className={cn("px-2 py-1 text-[8px] uppercase tracking-widest rounded transition-all", sortType === 'registration' ? "bg-luxury-gold text-luxury-bg font-bold" : "text-gray-500 hover:text-luxury-gold")}
                >
                  {t('registration')}
                </button>
                <button 
                  onClick={() => setSortType('category')}
                  className={cn("px-2 py-1 text-[8px] uppercase tracking-widest rounded transition-all", sortType === 'category' ? "bg-luxury-gold text-luxury-bg font-bold" : "text-gray-500 hover:text-luxury-gold")}
                >
                  {t('category')}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {filteredExpenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                  <Receipt size={48} className="opacity-20" />
                  <p className="text-sm italic">{t('no_expenses')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {filteredExpenses.map((exp) => {
                      const date = new Date(exp.created_at);
                      const regDate = exp.registered_at ? new Date(exp.registered_at) : null;
                      const isNew = (new Date().getTime() - date.getTime()) < 60000; // Less than 1 minute old

                      return (
                        <motion.div 
                          key={exp.id} 
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:border-luxury-gold/30 transition-all group relative overflow-hidden"
                        >
                          {isNew && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                          )}
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${CATEGORY_COLORS[exp.category] || DEFAULT_COLOR}20`, border: `1px solid ${CATEGORY_COLORS[exp.category] || DEFAULT_COLOR}40` }}
                            >
                              <Receipt size={18} style={{ color: CATEGORY_COLORS[exp.category] || DEFAULT_COLOR }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-200 group-hover:text-luxury-gold transition-colors">{exp.description}</p>
                                {isNew && (
                                  <span className="text-[8px] bg-luxury-gold text-luxury-bg px-1 rounded font-bold animate-pulse">NEW</span>
                                )}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider">
                                  <span style={{ color: CATEGORY_COLORS[exp.category] || DEFAULT_COLOR }}>{exp.category}</span>
                                  <span>•</span>
                                  <span>
                                    {date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short' })}
                                    {exp.has_time && ` ${t('hour_short')} ${date.toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`}
                                  </span>
                                </div>
                                {regDate && (
                                  <div className="flex items-center gap-1 text-[8px] text-gray-600 italic">
                                    <Clock size={8} />
                                    {t('registered')}: {regDate.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-luxury-gold">{(exp.amount || 0).toFixed(2)}€</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title={t('delete_expense')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* History Footer Navigation */}
            <div className="mt-6 pt-4 border-t border-luxury-gold/10 flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/40 border border-luxury-gold/20 rounded-lg p-1">
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                    className="p-1.5 hover:bg-luxury-gold/10 text-luxury-gold rounded transition-colors"
                    title={t('prev_month')}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => historyDateInputRef.current?.showPicker()}
                    className="p-1.5 hover:bg-luxury-gold/10 text-luxury-gold rounded transition-colors relative"
                    title={t('choose_month')}
                  >
                    <CalendarIcon size={16} />
                    <input 
                      type="month" 
                      ref={historyDateInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          const [year, month] = e.target.value.split('-');
                          setViewDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                        }
                      }}
                    />
                  </button>
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                    className="p-1.5 hover:bg-luxury-gold/10 text-luxury-gold rounded transition-colors"
                    title="Mese successivo"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold/60 ml-2">
                  {viewDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <button 
                onClick={() => setViewDate(new Date())}
                className="px-4 py-1.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded-full text-[10px] uppercase tracking-widest text-luxury-gold hover:bg-luxury-gold hover:text-luxury-bg font-bold transition-all shadow-sm"
              >
                {t('back_today')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors theme="dark" />
      <LuxeVaultApp />
    </ErrorBoundary>
  );
}
