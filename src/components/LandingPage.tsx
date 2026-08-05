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

      {/* LIVE INTERACTIVE DEMO (SIZE ADVISOR ENGINE EXPLAINED) */}
      <section id="demo-interactive-section" className={`py-20 px-4 sm:px-8 border-t ${darkMode ? 'bg-neutral-900/40 border-white/10' : 'bg-neutral-100 border-neutral-200'}`}>
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-black tracking-widest text-sky-400 uppercase">{isRtl ? "دموی تعاملی و ابزار زنده" : "Live Interactive Sizing Demo"}</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">{isRtl ? "موتور هوشمند پیشنهاد سایز تنخور را امتحان کنید" : "Experience the Smart Size Advisor Widget"}</h2>
            <p className={`text-xs sm:text-sm mt-3 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {isRtl ? "ابعاد بدنی فرضی را تغییر دهید تا نحوه محاسبه دقیق تک‌سایز پیشنهادی بدون نمایش بازه را به صورت آنلاین مشاهده کنید." : "Modify dimensions to observe how the calculation filters clothing size in real time."}
            </p>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl ${darkMode ? 'bg-neutral-950 border-white/10' : 'bg-white border-neutral-200'}`}>
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Form Input fields */}
              <div className="space-y-4">
                
                {/* Clothing Type Selector (5 System Clothing Types) */}
                <div>
                  <label className="block text-xs font-extrabold mb-1.5 text-neutral-400">{isRtl ? "انتخاب دسته لباس (Clothing Category):" : "Select Clothing Type:"}</label>
                  <div className="grid grid-cols-5 gap-1 bg-neutral-900/60 p-1 rounded-xl border border-white/5 text-[10px] text-center font-bold">
                    <button
                      type="button"
                      onClick={() => { setDemoClothingType('tops'); setDemoResult(''); }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${demoClothingType === 'tops' ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "بالاتنه" : "Tops"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDemoClothingType('bottoms'); setDemoResult(''); }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${demoClothingType === 'bottoms' ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "پایین‌تنه" : "Bottoms"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDemoClothingType('footwear'); setDemoResult(''); }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${demoClothingType === 'footwear' ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "کفش" : "Shoes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDemoClothingType('one_piece'); setDemoResult(''); }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${demoClothingType === 'one_piece' ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "سرهمی" : "OnePiece"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDemoClothingType('accessories'); setDemoResult(''); }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${demoClothingType === 'accessories' ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "اکسسوری" : "Acc"}
                    </button>
                  </div>
                </div>

                {/* Mode Selector */}
                {demoClothingType !== 'accessories' && demoClothingType !== 'footwear' && (
                  <div className="flex bg-neutral-900/40 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setDemoIsPrecisionMode(false)}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${!demoIsPrecisionMode ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "محاسبه هوشمند (قد و وزن)" : "Smart Estimation"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoIsPrecisionMode(true)}
                      className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${demoIsPrecisionMode ? 'bg-sky-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'}`}
                    >
                      {isRtl ? "ورود دقیق اندازه‌ها" : "Exact Measurements"}
                    </button>
                  </div>
                )}

                {demoClothingType === 'footwear' ? (
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-400">{isRtl ? "طول پا (سانتی‌متر):" : "Foot Length (cm):"}</label>
                        <span className="text-xs font-extrabold text-sky-400">{demoFootLength} cm</span>
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
                    <p className="text-[10px] text-neutral-400 leading-normal bg-sky-950/20 p-2.5 rounded-xl border border-sky-500/10">
                      {isRtl ? "پاشنه پا را به دیوار تکیه دهید و طول از پاشنه تا بلندترین انگشت را با خط‌کش اندازه بگیرید." : "Place heel against a wall and measure length to longest toe in cm."}
                    </p>
                  </div>
                ) : demoClothingType === 'accessories' ? (
                  <div className="p-4 rounded-2xl bg-neutral-900/30 border border-white/5 text-center space-y-2">
                    <p className="text-xs font-bold text-neutral-300">{isRtl ? "محصولات اکسسوری فری‌سایز یا تک‌سایز هستند." : "Accessory items are Free Size / One-Size."}</p>
                    <p className="text-[10px] text-neutral-400">{isRtl ? "نیاز به وارد کردن ابعاد خاصی وجود ندارد." : "No specific body measurements required."}</p>
                  </div>
                ) : !demoIsPrecisionMode ? (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-400">{t.height_cm}</label>
                        <span className="text-xs font-extrabold text-sky-400">{demoHeight} cm</span>
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

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-neutral-400">{t.weight_kg}</label>
                        <span className="text-xs font-extrabold text-sky-400">{demoWeight} kg</span>
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

                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-neutral-400">{t.body_shape}</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDemoShape('slim')}
                          className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all ${demoShape === 'slim' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-neutral-800 text-neutral-400'}`}
                        >
                          {t.shape_slim}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoShape('regular')}
                          className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all ${demoShape === 'regular' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-neutral-800 text-neutral-400'}`}
                        >
                          {isRtl ? "معمولی" : "Regular"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoShape('athletic')}
                          className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all ${demoShape === 'athletic' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-neutral-800 text-neutral-400'}`}
                        >
                          {t.shape_athletic}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDemoShape('heavy')}
                          className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all ${demoShape === 'heavy' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-neutral-800 text-neutral-400'}`}
                        >
                          {t.shape_heavy}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 p-3 rounded-2xl bg-neutral-900/40 border border-white/5">
                    {(demoClothingType === 'tops' || demoClothingType === 'one_piece') && (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-neutral-400 mb-1">
                          <span>{isRtl ? "دور سینه (بالاتنه)" : "Chest / Bust"}</span>
                          <span className="text-sky-400 font-extrabold">{demoChest} cm</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="140"
                          value={demoChest}
                          onChange={(e) => setDemoChest(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    )}

                    {(demoClothingType === 'bottoms' || demoClothingType === 'one_piece') && (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-neutral-400 mb-1">
                          <span>{isRtl ? "دور کمر (پایین‌تنه)" : "Waistline"}</span>
                          <span className="text-sky-400 font-extrabold">{demoWaist} cm</span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="130"
                          value={demoWaist}
                          onChange={(e) => setDemoWaist(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    )}

                    {(demoClothingType === 'bottoms' || demoClothingType === 'one_piece') && (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-neutral-400 mb-1">
                          <span>{isRtl ? "دور باسن" : "Hip Width"}</span>
                          <span className="text-sky-400 font-extrabold">{demoHip} cm</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="140"
                          value={demoHip}
                          onChange={(e) => setDemoHip(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    )}

                    {demoClothingType === 'tops' && (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-neutral-400 mb-1">
                          <span>{isRtl ? "عرض سرشانه" : "Shoulder Width"}</span>
                          <span className="text-sky-400 font-extrabold">{demoShoulder} cm</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="60"
                          value={demoShoulder}
                          onChange={(e) => setDemoShoulder(Number(e.target.value))}
                          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={calculateDemoSize}
                  className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-600/20"
                >
                  {t.calculate_size}
                </button>
              </div>

              {/* Dynamic Sizing recommendation Output - Single Specific Size */}
              <div className="flex flex-col justify-between bg-neutral-900/50 rounded-2xl p-6 border border-white/5 min-h-[260px]">
                <div className="text-center mb-2">
                  <p className="text-xs text-neutral-400 font-black tracking-wide uppercase">
                    {isRtl ? "خروجی تک‌سایز دقیق تنخور" : "Tankhor Single Definitive Size Result"}
                  </p>
                </div>
                
                {demoResult ? (
                  <div className="space-y-4 my-auto">
                    <div className="p-6 bg-gradient-to-b from-sky-500/20 via-indigo-500/10 to-transparent border border-sky-500/30 rounded-2xl text-center shadow-xl">
                      <span className="block text-xs font-black text-sky-400 mb-1 uppercase tracking-wider">
                        {demoClothingType === 'tops' && (isRtl ? "سایز پیشنهادی بالاتنه" : "Recommended Tops Size")}
                        {demoClothingType === 'bottoms' && (isRtl ? "سایز پیشنهادی پایین‌تنه" : "Recommended Bottoms Size")}
                        {demoClothingType === 'footwear' && (isRtl ? "سایز پیشنهادی کفش (EU)" : "Recommended Shoe Size")}
                        {demoClothingType === 'one_piece' && (isRtl ? "سایز پیشنهادی سرهمی" : "Recommended OnePiece Size")}
                        {demoClothingType === 'accessories' && (isRtl ? "وضعیت اکسسوری" : "Accessory Status")}
                      </span>
                      <span className="block text-5xl font-black text-white my-3 tracking-tight">{demoResult}</span>
                      <span className="block text-xs text-sky-200/80 font-medium leading-snug">{demoFitHint}</span>
                    </div>

                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isRtl ? "تک‌سایز دقیق بدون نمایش بازه سردرگم کننده" : "Single definitive size output"}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 text-xs py-14">
                    {isRtl ? "ابعاد بدنی را مشخص نموده و دکمه محاسبه را بزنید" : "Adjust inputs and click calculate size"}
                  </div>
                )}
              </div>

            </div>
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
