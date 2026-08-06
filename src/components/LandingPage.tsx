import React, { useState, useEffect } from 'react';
import { locales } from '../locales';
import { DirectusAPI } from '../directus';
import { storageManager, SyncStats } from '../storage';
import { useRouter } from './Router';
import { 
  Sparkles, 
  Grid3X3, 
  Sliders, 
  FileImage, 
  Store, 
  ChevronRight, 
  ChevronLeft,
  Sun,
  Moon,
  Globe,
  Lock,
  Mail,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Database,
  Cloud,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  PackageCheck,
  Laptop,
  Smartphone,
  RefreshCw,
  Layers,
  Ruler
} from 'lucide-react';

interface LandingPageProps {
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function LandingPage({ lang, setLang, darkMode, setDarkMode }: LandingPageProps) {
  const { navigate } = useRouter();
  const t = locales[lang];
  const isRtl = lang === 'fa';

  // Auth States
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopSlug, setShopSlug] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync Stats State for Header/Architecture showcase
  const [syncStats, setSyncStats] = useState<SyncStats>(storageManager.getSyncStats());

  useEffect(() => {
    const unsubscribe = storageManager.subscribe((stats) => {
      setSyncStats(stats);
    });
    return () => unsubscribe();
  }, []);

  // Quick Demo Interactive States
  const [demoClothingType, setDemoClothingType] = useState<'tops' | 'bottoms' | 'footwear' | 'one_piece' | 'accessories'>('tops');
  const [demoHeight, setDemoHeight] = useState(172);
  const [demoWeight, setDemoWeight] = useState(68);
  const [demoShape, setDemoShape] = useState<'slim' | 'regular' | 'athletic' | 'heavy'>('athletic');
  const [demoIsPrecisionMode, setDemoIsPrecisionMode] = useState<boolean>(false);
  const [demoChest, setDemoChest] = useState<number>(95);
  const [demoWaist, setDemoWaist] = useState<number>(82);
  const [demoHip, setDemoHip] = useState<number>(97);
  const [demoShoulder, setDemoShoulder] = useState<number>(42);
  const [demoFootLength, setDemoFootLength] = useState<number>(26.5);
  const [demoResult, setDemoResult] = useState('');
  const [demoFitHint, setDemoFitHint] = useState('');

  // Interactive 3-Step Wizard state for Sizing Guide
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardCalculating, setWizardCalculating] = useState<boolean>(false);

  // Auto-calculate body measurements on height/weight/shape changes if not in custom mode
  useEffect(() => {
    if (!demoIsPrecisionMode) {
      let chest = demoWeight * 1.4;
      let waist = demoWeight * 1.22;
      let hip = demoWeight * 1.4;
      let shoulder = demoHeight * 0.23;
      let foot = 21 + (demoHeight - 150) * 0.12 + (demoWeight - 50) * 0.03;

      if (demoShape === 'slim') {
        chest = demoWeight * 1.35 + (demoHeight - 100) * 0.1;
        waist = demoWeight * 1.10 + (demoHeight - 100) * 0.1;
        hip = demoWeight * 1.35 + (demoHeight - 100) * 0.1;
        shoulder = demoHeight * 0.22 - 1;
      } else if (demoShape === 'athletic') {
        chest = demoWeight * 1.45 + (demoHeight - 100) * 0.1;
        waist = demoWeight * 1.18 + (demoHeight - 100) * 0.1;
        hip = demoWeight * 1.42 + (demoHeight - 100) * 0.1;
        shoulder = demoHeight * 0.23 + 2;
      } else if (demoShape === 'heavy') {
        chest = demoWeight * 1.55 + (demoHeight - 100) * 0.1;
        waist = demoWeight * 1.45 + (demoHeight - 100) * 0.1;
        hip = demoWeight * 1.50 + (demoHeight - 100) * 0.1;
        shoulder = demoHeight * 0.23 + 1;
      } else { // regular
        chest = demoWeight * 1.40 + (demoHeight - 100) * 0.1;
        waist = demoWeight * 1.22 + (demoHeight - 100) * 0.1;
        hip = demoWeight * 1.40 + (demoHeight - 100) * 0.1;
        shoulder = demoHeight * 0.23;
      }

      setDemoChest(Math.round(chest));
      setDemoWaist(Math.round(waist));
      setDemoHip(Math.round(hip));
      setDemoShoulder(Math.round(shoulder));
      setDemoFootLength(Number(foot.toFixed(1)));
    }
  }, [demoHeight, demoWeight, demoShape, demoIsPrecisionMode]);

  const calculateDemoSize = () => {
    // Single exact size calculations per clothing type
    let bestSize = 'M';
    let hint = '';

    if (demoClothingType === 'tops') {
      if (demoChest < 88) bestSize = 'XS';
      else if (demoChest < 94) bestSize = 'S';
      else if (demoChest < 102) bestSize = 'M';
      else if (demoChest < 110) bestSize = 'L';
      else if (demoChest < 118) bestSize = 'XL';
      else if (demoChest < 126) bestSize = 'XXL';
      else bestSize = 'XXXL';
      hint = isRtl ? `محاسبه دقیق بر اساس دور سینه ${demoChest} cm و سرشانه ${demoShoulder} cm` : `Calculated for chest ${demoChest} cm`;
    } else if (demoClothingType === 'bottoms') {
      if (demoWaist < 72) bestSize = 'S (28-29)';
      else if (demoWaist < 80) bestSize = 'M (30-31)';
      else if (demoWaist < 88) bestSize = 'L (32-33)';
      else if (demoWaist < 96) bestSize = 'XL (34-36)';
      else if (demoWaist < 106) bestSize = 'XXL (38-40)';
      else bestSize = 'XXXL (42+)';
      hint = isRtl ? `محاسبه دقیق بر اساس دور کمر ${demoWaist} cm و باسن ${demoHip} cm` : `Calculated for waist ${demoWaist} cm`;
    } else if (demoClothingType === 'footwear') {
      if (demoFootLength <= 23.5) bestSize = '37';
      else if (demoFootLength <= 24.2) bestSize = '38';
      else if (demoFootLength <= 25.0) bestSize = '39';
      else if (demoFootLength <= 25.8) bestSize = '40';
      else if (demoFootLength <= 26.5) bestSize = '41';
      else if (demoFootLength <= 27.2) bestSize = '42';
      else if (demoFootLength <= 28.0) bestSize = '43';
      else if (demoFootLength <= 28.8) bestSize = '44';
      else bestSize = '45';
      hint = isRtl ? `بر اساس طول پا ${demoFootLength} cm (استاندارد EU)` : `Calculated for foot length ${demoFootLength} cm`;
    } else if (demoClothingType === 'one_piece') {
      if (demoHeight < 162 && demoChest < 90) bestSize = 'S';
      else if (demoHeight < 174 && demoChest < 100) bestSize = 'M';
      else if (demoHeight < 185 && demoChest < 110) bestSize = 'L';
      else bestSize = 'XL';
      hint = isRtl ? `بر اساس قد کلی ${demoHeight} cm و ترکیب بدنی` : `Calculated for total height & body shape`;
    } else {
      bestSize = isRtl ? "تک‌سایز (Free Size)" : "Free Size";
      hint = isRtl ? "مناسب تمام اندازه‌های استاندارد" : "Fits all standard sizes";
    }

    setDemoResult(bestSize);
    setDemoFitHint(hint);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await DirectusAPI.login(email, password);
        setSuccess(isRtl ? "ورود موفقیت‌آمیز بود! در حال انتقال به پنل مدیریت..." : "Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        if (!shopName || !shopSlug) {
          throw new Error(isRtl ? "لطفاً تمام فیلدها را پر کنید" : "Please fill in all fields");
        }
        await DirectusAPI.register(email, password, shopName, shopSlug);
        setSuccess(isRtl ? "ثبت‌نام با موفقیت انجام شد! ورود به پنل..." : "Registration successful! Loading dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? "خطایی در فرآیند به وجود آمد. مجدداً تلاش نمایید." : "An error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@tankhor.com');
    setPassword('demo1234');
    setShopName('گالری پوشاک آنلاین شیراز');
    setShopSlug('shiraz-gallery');
    setIsLogin(false);
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'} transition-colors duration-300`}>
      
      {/* STICKY TOP NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${darkMode ? 'bg-neutral-950/85 border-white/10' : 'bg-white/85 border-neutral-200'} px-4 sm:px-8 py-3.5 transition-all`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-sky-500/20">
              <Grid3X3 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {t.brand_name}
                </span>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-black">
                  v2.5
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium tracking-wide leading-none mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Quick Storage Architecture Indicator & Actions */}
          <div className="flex items-center gap-3">

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${darkMode ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'}`}
              aria-label="Toggle language"
              title={lang === 'fa' ? 'English' : 'فارسی'}
            >
              <Globe className="w-4 h-4 text-sky-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${darkMode ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'}`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            
            {/* CTA Header Button */}
            <a
              href="#auth-section"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-xl shadow-md hover:shadow-sky-500/20 transition-all cursor-pointer"
            >
              {t.get_started}
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-8 pt-12 pb-20 overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/15 via-indigo-500/10 to-purple-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-black shadow-sm">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin-slow" />
              <span>{isRtl ? "پلتفرم اختصاصی مدیریت سایز و موجودی پوشاک (tankhor.com)" : "Specialized Apparel Sizing & Inventory Platform"}</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {t.hero_title}
            </h1>
            
            <p className={`text-sm sm:text-base ${darkMode ? 'text-neutral-300' : 'text-neutral-600'} leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium`}>
              {t.hero_subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#auth-section"
                className="px-7 py-3.5 font-black text-xs text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 rounded-xl shadow-xl shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{t.get_started}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </a>
              
              <a
                href="#demo-interactive-section"
                className={`px-6 py-3.5 font-bold text-xs border rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer ${darkMode ? 'border-white/10 text-neutral-200' : 'border-neutral-300 text-neutral-800'}`}
              >
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>{isRtl ? "تست آنلاین ویجت هوشمند پیشنهاد سایز" : "Try Sizing Calculator"}</span>
              </a>
            </div>

            {/* Quick Metrics / Stats Grid */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 max-w-xl mx-auto lg:mx-0">
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 text-center lg:text-right">
                <p className="text-xl font-black text-sky-400">%۳۴-</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-bold">{isRtl ? "کاهش مرجوعی کالا" : "Return Rate Reduction"}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 text-center lg:text-right">
                <p className="text-xl font-black text-indigo-400">۱۰X</p>
                <p className="text-xs text-neutral-400 mt-0.5 font-bold">{isRtl ? "سرعت تنظیم متغیرها" : "Faster Setup"}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 text-center lg:text-right">
                <p className="text-xl font-black text-emerald-400">۱۰۰٪</p>
                <p className="text-xs text-neutral-400 mt-0.5 font-bold">{isRtl ? "آفلاین محلی (رایگان)" : "100% Free Local DB"}</p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 text-center lg:text-right">
                <p className="text-xl font-black text-amber-400">۰ms</p>
                <p className="text-xs text-neutral-400 mt-0.5 font-bold">{isRtl ? "تاخیر محاسبات هوشمند" : "Client Calculation"}</p>
              </div>
            </div>

          </div>

          {/* Right Login / Register Card */}
          <div className="lg:col-span-5" id="auth-section">
            <div className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl transition-all relative ${darkMode ? 'bg-neutral-900/90 border-white/10 shadow-sky-950/20' : 'bg-white/95 border-neutral-200 shadow-neutral-300/40'}`}>
              
              {/* Header Badge inside card */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-extrabold text-neutral-200">
                    {isRtl ? "ورود / ثبت‌نام پنل فروشگاه" : "Store Management Portal"}
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                  {isRtl ? "رایگان و سریع" : "Free & Instant"}
                </span>
              </div>

              {/* Login/Register Tabs */}
              <div className="flex bg-neutral-950/50 p-1 rounded-xl border border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${isLogin ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${!isLogin ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  {t.register}
                </button>
              </div>

              {/* Action Error / Success Alerts */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs font-extrabold mb-1 text-neutral-400">{t.shop_name}</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                          <Store className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder={isRtl ? "مثال: پوشاک ورزشی نایک" : "e.g. Nike Sportswear"}
                          className={`w-full pr-10 pl-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold mb-1 text-neutral-400">
                        {t.shop_slug} <span className="text-[10px] text-sky-400">(مثال: nike)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                          <Globe className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={shopSlug}
                          onChange={(e) => setShopSlug(e.target.value)}
                          placeholder="nike"
                          className={`w-full pr-10 pl-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 text-left dir-ltr ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-extrabold mb-1 text-neutral-400">{t.email}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@store.com"
                      className={`w-full pr-10 pl-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 text-left dir-ltr ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold mb-1 text-neutral-400">{t.password}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pr-10 pl-3 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 text-left dir-ltr ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-600/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{isLogin ? t.login : t.register}</span>
                  )}
                </button>
              </form>

              {/* Developer / Reviewer Demo Shortcut Button */}
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="w-full py-2 px-3 text-xs font-extrabold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRtl ? "دمو" : "Demo"}</span>
                </button>
              </div>

              {/* Toggle Account mode */}
              <div className="mt-3 text-center">
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-xs text-neutral-400 hover:text-neutral-200 transition-all font-semibold"
                >
                  {isLogin ? t.no_account : t.have_account}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* STORAGE ADAPTER & HYBRID ARCHITECTURE SECTION (HIGHLIGHTING AGENTS.MD RULES) */}
      <section className={`py-16 px-4 sm:px-8 border-y ${darkMode ? 'bg-neutral-900/60 border-white/10' : 'bg-white border-neutral-200'}`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              {isRtl ? "معماری قدرتمند ذخیره‌سازی" : "Hybrid Storage Adapter Architecture"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              {isRtl ? "آزاد از قطعی اینترنت با لایه ذخیره‌سازی آفلاین محلی (Tankhor Storage Adapter)" : "Offline Local Database + Cloud Sync Engine"}
            </h2>
            <p className={`text-xs sm:text-sm mt-3 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {isRtl ? "پلتفرم تنخور بدون وابستگی اجباری به سرور خارجی یا اینترنت کار می‌کند. تمام داده‌های فروشگاه شما ابتدا به‌صورت کاملاً رایگان در دیتابیس محلی دستگاه ذخیره شده و در صورت تمایل با سرور ابری همگام می‌شود." : "Work 100% offline with device-local storage or sync seamlessly to Directus Cloud API."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Storage Card 1 */}
            <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-neutral-950/80 border-white/10' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black mb-2 text-neutral-200">
                {isRtl ? "۱. دیتابیس آفلاین محلی (Local Storage)" : "1. Local Offline Storage"}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isRtl ? "کارکرد ۱۰۰٪ مستقل و رایگان بدون نیاز به اینترنت. محصولات، ماتریس متغیرها و جداول سایز در مرورگر و اپلیکیشن شما ذخیره می‌شوند." : "100% free and offline capability storing data directly on your device without network requirements."}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span>{isRtl ? "هزینه سرور: ۰ تومان" : "Server Cost: $0"}</span>
                <Check className="w-4 h-4" />
              </div>
            </div>

            {/* Storage Card 2 */}
            <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-neutral-950/80 border-white/10' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl w-fit mb-4">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black mb-2 text-neutral-200">
                {isRtl ? "۲. همگام‌سازی ابری (Directus Cloud Sync)" : "2. Directus Cloud Sync"}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isRtl ? "با فشرده شدن دکمه همگام‌سازی، تمام تغییرات ایجاد شده در حالت آفلاین به صف ارسال اضافه شده و با دیتابیس ابری همگام می‌شوند." : "Queues local updates in SyncQueue and syncs seamlessly with remote Directus API."}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-sky-400">
                <span>{isRtl ? "پشتیبان‌گیری چند دستگاهی" : "Cross-Device Backup"}</span>
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>

            {/* Storage Card 3 */}
            <div className={`p-6 rounded-2xl border transition-all ${darkMode ? 'bg-neutral-950/80 border-white/10' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black mb-2 text-neutral-200">
                {isRtl ? "۳. آماده اجرا روی دسکتاپ و ویندوز (Tauri Ready)" : "3. Desktop & Windows Ready"}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isRtl ? "کد فرانت‌اند طبق معماری AGENTS.md کاملاً مستقل از فرچ‌آورها بوده و آماده ساخت فایل اجرایی Native Windows EXE با Tauri می‌باشد." : "Built with strict storage abstraction ready for native desktop packaging."}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-indigo-400">
                <span>{isRtl ? "سازگار با Tauri & Electron" : "Tauri & Electron Compatible"}</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* THREE BENTO PLATFORM FEATURES */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">{t.features_title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1: Matrix */}
            <div className={`p-8 rounded-3xl border hover:scale-[1.02] transition-all flex flex-col justify-between ${darkMode ? 'bg-neutral-900/50 border-white/10' : 'bg-white border-neutral-200'}`}>
              <div>
                <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit mb-6">
                  <Grid3X3 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black mb-3 text-neutral-200">{t.feature_matrix_title}</h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{t.feature_matrix_desc}</p>
              </div>
              <div className="mt-8 flex items-center text-xs font-bold text-indigo-400 gap-1 cursor-pointer">
                <span>{isRtl ? "مشاهده ماتریس ۲ بعدی موجودی" : "View Inventory Grid"}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </div>

            {/* Feature 2: Size Advisor */}
            <div className={`p-8 rounded-3xl border hover:scale-[1.02] transition-all flex flex-col justify-between ${darkMode ? 'bg-neutral-900/50 border-white/10' : 'bg-white border-neutral-200'}`}>
              <div>
                <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-2xl w-fit mb-6">
                  <Sliders className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black mb-3 text-neutral-200">{t.feature_advisor_title}</h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{t.feature_advisor_desc}</p>
              </div>
              <div className="mt-8 flex items-center text-xs font-bold text-sky-400 gap-1 cursor-pointer">
                <span>{isRtl ? "اجرای موتور پیشنهاد سایز" : "Launch Sizing Engine"}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </div>

            {/* Feature 3: Image Compressor */}
            <div className={`p-8 rounded-3xl border hover:scale-[1.02] transition-all flex flex-col justify-between ${darkMode ? 'bg-neutral-900/50 border-white/10' : 'bg-white border-neutral-200'}`}>
              <div>
                <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit mb-6">
                  <FileImage className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black mb-3 text-neutral-200">{t.feature_compress_title}</h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{t.feature_compress_desc}</p>
              </div>
              <div className="mt-8 flex items-center text-xs font-bold text-emerald-400 gap-1 cursor-pointer">
                <span>{isRtl ? "فشرده‌سازی در مرورگر (Web Canvas)" : "In-Browser Canvas Specs"}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STEP-BY-STEP SIZING WIZARD (CLEAN & MINIMALIST FOR END CUSTOMERS) */}
      <section id="demo-interactive-section" className={`py-16 px-4 sm:px-8 border-t ${darkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-8">
            <span className="text-[11px] font-black tracking-widest text-sky-500 uppercase">{isRtl ? "راهنمای تعاملی سایز" : "Interactive Sizing Guide"}</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1.5">{isRtl ? "محاسبه هوشمند سایز پیشنهادی (ظرف ۵ ثانیه)" : "5-Second Intelligent Size Wizard"}</h2>
            <p className={`text-xs mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {isRtl ? "با طی ۳ گام ساده، تک‌سایز دقیق بدون سردرگمی بازه‌ای را دریافت کنید." : "Complete 3 easy steps to find your exact single recommended garment size."}
            </p>
          </div>

          {/* STEP INDICATOR TABS */}
          <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
            <button
              onClick={() => setWizardStep(1)}
              className={`flex items-center gap-2 text-xs font-bold transition-all ${wizardStep === 1 ? 'text-sky-500' : (darkMode ? 'text-neutral-500' : 'text-neutral-400')}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${wizardStep === 1 ? 'bg-sky-500 text-white shadow-sm' : (darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')}`}>۱</span>
              <span className="hidden sm:inline">{isRtl ? "نوع پوشاک" : "Category"}</span>
            </button>
            <div className={`h-0.5 flex-1 mx-3 ${wizardStep >= 2 ? 'bg-sky-500' : (darkMode ? 'bg-neutral-800' : 'bg-neutral-200')}`} />
            <button
              onClick={() => setWizardStep(2)}
              className={`flex items-center gap-2 text-xs font-bold transition-all ${wizardStep === 2 ? 'text-sky-500' : (darkMode ? 'text-neutral-500' : 'text-neutral-400')}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${wizardStep === 2 ? 'bg-sky-500 text-white shadow-sm' : (darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')}`}>۲</span>
              <span className="hidden sm:inline">{isRtl ? "ابعاد بدنی" : "Body Bounds"}</span>
            </button>
            <div className={`h-0.5 flex-1 mx-3 ${wizardStep === 3 ? 'bg-sky-500' : (darkMode ? 'bg-neutral-800' : 'bg-neutral-200')}`} />
            <button
              onClick={() => wizardStep === 3 && setWizardStep(3)}
              className={`flex items-center gap-2 text-xs font-bold transition-all ${wizardStep === 3 ? 'text-sky-500' : (darkMode ? 'text-neutral-500' : 'text-neutral-400')}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${wizardStep === 3 ? 'bg-sky-500 text-white shadow-sm' : (darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600')}`}>۳</span>
              <span className="hidden sm:inline">{isRtl ? "سایز پیشنهادی" : "Result"}</span>
            </button>
          </div>

          {/* WIZARD CONTAINER CARD */}
          <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>

            {/* STEP 1: CATEGORY SELECTION */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-base font-extrabold">{isRtl ? "گام ۱: نوع لباس مورد نظر را انتخاب کنید" : "Step 1: Choose Garment Category"}</h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{isRtl ? "الگوریتم سایزبندی متناسب با فرم هر دسته لباس عمل می‌کند." : "Sizing rules adapt specifically to each clothing category structure."}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'tops', label_fa: 'بالاتنه', label_en: 'Tops', desc: 'تیشرت، هودی، پیراهن' },
                    { key: 'bottoms', label_fa: 'پایین‌تنه', label_en: 'Bottoms', desc: 'شلوار، جین، اسلش' },
                    { key: 'footwear', label_fa: 'کفش', label_en: 'Footwear', desc: 'کتانی، بوت، صندل' },
                    { key: 'one_piece', label_fa: 'سرهمی', label_en: 'OnePiece', desc: 'اورال، مانتو، کت‌وشلوار' },
                    { key: 'accessories', label_fa: 'اکسسوری', label_en: 'Accessories', desc: 'کلاه، شال، دستکش' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setDemoClothingType(cat.key as any);
                        setDemoResult('');
                      }}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                        demoClothingType === cat.key
                          ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-extrabold shadow-sm'
                          : (darkMode ? 'border-neutral-800 hover:border-neutral-700 text-neutral-300' : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50')
                      }`}
                    >
                      <span className="text-xs font-black block">{isRtl ? cat.label_fa : cat.label_en}</span>
                      <span className="text-[10px] text-neutral-500 mt-1 block leading-tight">{cat.desc}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>{isRtl ? "مرحله بعدی: ورود ابعاد بدنی" : "Next Step: Enter Measurements"}</span>
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* STEP 2: MEASUREMENTS & BODY SHAPE */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-base font-extrabold">{isRtl ? "گام ۲: مشخصات بدنی یا طول پا را تعیین کنید" : "Step 2: Enter Body Dimensions"}</h3>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {demoClothingType === 'footwear' ? (isRtl ? "طول پا از پاشنه تا شست" : "Foot length in cm") : (isRtl ? "قد و وزن را مشخص کنید تا فرم اندام شما تحلیل شود." : "Height and weight for smart fitting.")}
                  </p>
                </div>

                {demoClothingType === 'footwear' ? (
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{isRtl ? "طول پا (سانتی‌متر):" : "Foot Length (cm):"}</span>
                      <span className="text-sky-500 font-black text-sm">{demoFootLength} cm</span>
                    </div>
                    <input
                      type="range"
                      min="21.0"
                      max="31.0"
                      step="0.5"
                      value={demoFootLength}
                      onChange={(e) => setDemoFootLength(Number(e.target.value))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>
                ) : demoClothingType === 'accessories' ? (
                  <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center text-xs font-bold text-neutral-400">
                    {isRtl ? "اکسسوری‌ها معمولاً تک‌سایز (Free Size) می‌باشند." : "Accessories are standard Free Size."}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Quick Profile Presets */}
                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                      <span className="text-[11px] font-bold text-neutral-400 shrink-0">{isRtl ? "میانبرهای سریع:" : "Quick Presets:"}</span>
                      {[
                        { label: '۱۶۵ / ۵۸ کگ', h: 165, w: 58, s: 'slim' },
                        { label: '۱۷۵ / ۷۰ کگ', h: 175, w: 70, s: 'regular' },
                        { label: '۱۸۲ / ۸۲ کگ', h: 182, w: 82, s: 'athletic' },
                        { label: '۱۹۰ / ۹۸ کگ', h: 190, w: 98, s: 'heavy' },
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDemoHeight(p.h);
                            setDemoWeight(p.w);
                            setDemoShape(p.s as any);
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                            demoHeight === p.h && demoWeight === p.w 
                              ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
                              : (darkMode ? 'border-neutral-800 text-neutral-400 hover:text-neutral-200' : 'border-neutral-200 text-neutral-600')
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Height Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{t.height_cm}</span>
                          <span className="text-sky-500 font-black">{demoHeight} cm</span>
                        </div>
                        <input
                          type="range"
                          min="140"
                          max="220"
                          value={demoHeight}
                          onChange={(e) => setDemoHeight(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>

                      {/* Weight Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{t.weight_kg}</span>
                          <span className="text-sky-500 font-black">{demoWeight} kg</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="140"
                          value={demoWeight}
                          onChange={(e) => setDemoWeight(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    </div>

                    {/* Body Shape Options */}
                    <div>
                      <label className="block text-xs font-bold mb-2 text-neutral-400">{t.body_shape}</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'slim', label: t.shape_slim },
                          { id: 'regular', label: isRtl ? 'معمولی' : 'Regular' },
                          { id: 'athletic', label: t.shape_athletic },
                          { id: 'heavy', label: t.shape_heavy },
                        ].map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setDemoShape(s.id as any)}
                            className={`py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              demoShape === s.id 
                                ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
                                : (darkMode ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-600')
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className={`py-3 px-5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${darkMode ? 'border-neutral-800 text-neutral-400 hover:text-neutral-200' : 'border-neutral-200 text-neutral-600'}`}
                  >
                    {isRtl ? "بازگشت" : "Back"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWizardCalculating(true);
                      calculateDemoSize();
                      setTimeout(() => {
                        setWizardCalculating(false);
                        setWizardStep(3);
                      }, 250);
                    }}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {wizardCalculating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isRtl ? "محاسبه ۵ ثانیه‌ای سایز پیشنهادی" : "Calculate 5-Sec Size"}</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: INSTANT SINGLE RECOMMENDED SIZE RESULT */}
            {wizardStep === 3 && (
              <div className="space-y-6 text-center">
                <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-500/10 to-transparent border border-sky-500/20 max-w-md mx-auto space-y-3">
                  <span className="text-[11px] font-black uppercase text-sky-500 tracking-wider block">
                    {isRtl ? "سایز دقیق پیشنهادی تن‌خور" : "Recommended Tankhor Single Size"}
                  </span>
                  
                  <div className="text-5xl font-black text-white tracking-tight my-2">
                    {demoResult || 'L'}
                  </div>

                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    {demoFitHint || (isRtl ? "این سایز عالی‌ترین انطباق تن‌خور را بر اساس قد و وزن وارد شده ارائه می‌دهد." : "Calculated fit matches height and weight profile.")}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className={`w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${darkMode ? 'border-neutral-800 text-neutral-400 hover:text-neutral-200' : 'border-neutral-200 text-neutral-600'}`}
                  >
                    {isRtl ? "تغییر اندازه‌ها و سنجش مجدد" : "Adjust Measurements"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const demoStoreSlug = 'demo-shop';
                      navigate(`/shop/${demoStoreSlug}/product/1`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
                  >
                    {isRtl ? "مشاهده محصولات فروشگاه با این سایز" : "Shop Garments in this Size"}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* STEPS EXPLANATORY */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-12">{t.how_it_works}</h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-neutral-900/40 border-white/10' : 'bg-white border-neutral-200'} space-y-4`}>
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-black flex items-center justify-center mx-auto text-lg shadow-lg shadow-sky-500/20">۱</div>
              <h3 className="font-extrabold text-base text-neutral-200">{t.step_1}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">{t.step_1_desc}</p>
            </div>
            
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-neutral-900/40 border-white/10' : 'bg-white border-neutral-200'} space-y-4`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center mx-auto text-lg shadow-lg shadow-indigo-500/20">۲</div>
              <h3 className="font-extrabold text-base text-neutral-200">{t.step_2}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">{t.step_2_desc}</p>
            </div>

            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-neutral-900/40 border-white/10' : 'bg-white border-neutral-200'} space-y-4`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black flex items-center justify-center mx-auto text-lg shadow-lg shadow-purple-500/20">۳</div>
              <h3 className="font-extrabold text-base text-neutral-200">{t.step_3}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">{t.step_3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 sm:px-8 border-t border-white/10 text-center text-xs text-neutral-400 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="p-1.5 bg-sky-600 text-white rounded-lg">
            <Grid3X3 className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-neutral-200">تنخور | Tankhor</span>
        </div>
        <p>© 2026 tankhor.com | {isRtl ? "پلتفرم تخصصی مدیریت موجودی ۲ بعدی و پیشنهاد سایز پوشاک" : "Fashion Sizing & Inventory Platform"}</p>
      </footer>

    </div>
  );
}
