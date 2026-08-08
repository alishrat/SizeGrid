import React, { useState, useEffect } from 'react';
import { updateService } from '../updateService';
import { UpdateState } from '../types';
import { useTranslation } from '../i18n';
import { ArrowUpCircle, Sparkles, X, RefreshCw, Download, CheckCircle, AlertTriangle } from 'lucide-react';

export const UpdateModal: React.FC = () => {
  const { t, isRtl, lang } = useTranslation();
  const [updateState, setUpdateState] = useState<UpdateState>(updateService.getState());

  useEffect(() => {
    const unsubscribe = updateService.subscribe((state) => {
      setUpdateState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!updateState.showStartupModal || !updateState.latestRelease || !updateService.isDesktopOrNativeApp()) {
    return null;
  }

  const handleDismiss = () => {
    updateService.dismissStartupModal();
  };

  const handleDownloadInstall = async () => {
    await updateService.downloadAndInstallUpdate();
  };

  const changelogItems = updateState.latestRelease.changelog?.[lang === 'fa' ? 'fa' : 'en'] || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-neutral-800 overflow-hidden transform transition-all ${isRtl ? 'rtl' : 'ltr'}`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-1">
                  {isRtl ? 'نسخه جدید آماده است' : 'NEW UPDATE READY'}
                </span>
                <h2 className="text-lg font-bold">
                  {isRtl ? 'به‌روزرسانی جدید نرم‌افزار تن‌خور' : 'New Tankhor App Update Available'}
                </h2>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
              title={t('cancel')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Version Pill Header */}
          <div className="mt-4 flex items-center gap-2 text-xs bg-white/15 backdrop-blur-md py-2 px-3.5 rounded-xl border border-white/20 w-fit">
            <span className="text-white/80">{t('current_version')}: <span className="font-mono font-bold text-white">v{updateState.currentVersion}</span></span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-bold text-emerald-200">v{updateState.latestRelease.version}</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-neutral-200">
          {/* Changelog section */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
              {t('changelog_title')}
            </h3>
            <div className="bg-slate-50 dark:bg-neutral-950/60 rounded-2xl p-4 border border-slate-100 dark:border-neutral-800/80">
              <ul className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-neutral-300">
                {changelogItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Download progress bar */}
          {updateState.status === 'downloading' && (
            <div className="space-y-2 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <div className="flex justify-between text-xs text-blue-900 dark:text-blue-200 font-bold">
                <span>{t('downloading_update')}</span>
                <span>{updateState.downloadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${updateState.downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ready to install notification */}
          {updateState.status === 'ready_to_install' && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{t('ready_to_install')}</span>
            </div>
          )}

          {/* Error notification */}
          {updateState.status === 'error' && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-semibold rounded-2xl border border-rose-200 dark:border-rose-800/60">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{updateState.errorMessage || t('update_error')}</span>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {updateState.status === 'ready_to_install' ? (
              <button
                type="button"
                onClick={() => updateService.relaunchApp()}
                className="w-full py-3 px-5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('relaunch_now')}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDownloadInstall}
                  disabled={updateState.status === 'downloading'}
                  className="flex-1 py-3 px-5 rounded-2xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{updateState.status === 'downloading' ? t('downloading_update') : t('download_install_update')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-3 px-4 rounded-2xl font-medium text-xs bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 transition-all cursor-pointer"
                >
                  {isRtl ? 'بعداً یادآوری کن' : 'Remind Me Later'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
