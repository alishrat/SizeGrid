import React, { useState, useEffect } from 'react';
import { updateService } from '../updateService';
import { UpdateState } from '../types';
import { useTranslation } from '../i18n';
import { RefreshCw, Download, CheckCircle, AlertTriangle, ArrowUpCircle, Sparkles } from 'lucide-react';

export const AppUpdateWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t, isRtl, lang } = useTranslation();
  const [updateState, setUpdateState] = useState<UpdateState>(updateService.getState());

  useEffect(() => {
    const unsubscribe = updateService.subscribe((state) => {
      setUpdateState(state);
    });
    return () => unsubscribe();
  }, []);

  const handleCheckUpdates = async () => {
    await updateService.checkForUpdates();
  };

  const handleDownloadInstall = async () => {
    await updateService.downloadAndInstallUpdate();
  };

  const formattedLastChecked = updateState.lastCheckedTime
    ? new Date(updateState.lastCheckedTime).toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {updateState.status === 'update_available' ? (
          <button
            onClick={handleDownloadInstall}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded-full shadow-sm transition-all animate-pulse"
            title={t('update_available')}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>v{updateState.latestRelease?.version}</span>
          </button>
        ) : (
          <button
            onClick={handleCheckUpdates}
            disabled={updateState.status === 'checking'}
            className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-full transition-all border border-slate-200"
            title={t('check_updates')}
          >
            <RefreshCw className={`w-3 h-3 ${updateState.status === 'checking' ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>v{updateState.currentVersion}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{t('app_updates')}</h3>
            <p className="text-xs text-slate-500">
              {t('current_version')}: <span className="font-mono font-medium text-slate-700">v{updateState.currentVersion}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleCheckUpdates}
          disabled={updateState.status === 'checking' || updateState.status === 'downloading'}
          className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-lg transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${updateState.status === 'checking' ? 'animate-spin' : ''}`} />
          <span>{updateState.status === 'checking' ? t('checking_updates') : t('check_updates')}</span>
        </button>
      </div>

      {/* UPDATE STATES & NOTIFICATIONS */}
      {updateState.status === 'up_to_date' && (
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('up_to_date')}</span>
          {formattedLastChecked && (
            <span className="text-emerald-600 border-r border-emerald-200 pr-2 mr-auto text-[11px]">
              {t('last_checked')}: {formattedLastChecked}
            </span>
          )}
        </div>
      )}

      {updateState.status === 'error' && (
        <div className="flex items-center gap-2 text-xs bg-rose-50 text-rose-800 p-3 rounded-lg border border-rose-100">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{updateState.errorMessage || t('update_error')}</span>
        </div>
      )}

      {/* UPDATE AVAILABLE BANNER & CHANGELOG */}
      {(updateState.status === 'update_available' || updateState.status === 'downloading' || updateState.status === 'ready_to_install') && updateState.latestRelease && (
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl p-4 border border-blue-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-bold rounded-full uppercase">NEW</span>
              <span className="font-semibold text-slate-900 text-sm">
                v{updateState.latestRelease.version}
              </span>
              <span className="text-xs text-slate-500">({updateState.latestRelease.releaseDate})</span>
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {t('update_available')}
            </span>
          </div>

          {/* CHANGELOG LIST */}
          <div className="space-y-1.5 text-xs text-slate-700 pt-1">
            <div className="font-medium text-slate-900">{t('changelog_title')}:</div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              {(updateState.latestRelease.changelog[lang === 'fa' ? 'fa' : 'en'] || []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* PROGRESS BAR */}
          {updateState.status === 'downloading' && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[11px] text-blue-800 font-medium">
                <span>{t('downloading_update')}</span>
                <span>{updateState.downloadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${updateState.downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {updateState.status === 'ready_to_install' && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-100 p-2 rounded-lg text-center">
              {t('ready_to_install')}
            </div>
          )}

          {/* ACTION BUTTON */}
          {updateState.status === 'update_available' && (
            <button
              onClick={handleDownloadInstall}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 rounded-lg transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t('download_install_update')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
