// ============================================================================
// CR AUDIOVIZ AI - CREATE CAMPAIGN MODAL
// Modal for creating new marketing campaigns
// Created: 2025-11-25
// Version: 1.0.0
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface App {
  app_id: string;
  name: string;
  slug: string;
  icon_url?: string;
}

interface CampaignFormData {
  name: string;
  description: string;
  campaign_type: 'cross_sell' | 'third_party' | 'internal';
  status: 'draft' | 'active' | 'scheduled';
  source_apps: string[];
  target_apps: string[];
  placement_zones: string[];
  start_date: string;
  end_date: string;
  budget: number;
  daily_budget_cap: number;
  headline: string;
  body: string;
  cta_text: string;
  destination_url: string;
  priority: number;
}

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  apps: App[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PLACEMENT_ZONES = [
  { id: 'sidebar', label: 'Sidebar', description: 'Promotional sidebar widget' },
  { id: 'banner', label: 'Banner', description: 'Top/bottom page banners' },
  { id: 'modal', label: 'Modal', description: 'Triggered modal promotions' },
  { id: 'in-app', label: 'In-App Card', description: 'Embedded content cards' },
  { id: 'footer', label: 'Footer', description: 'Footer promotional section' },
  { id: 'dashboard', label: 'Dashboard Widget', description: 'Dashboard recommendation widget' },
];

const INITIAL_FORM_DATA: CampaignFormData = {
  name: '',
  description: '',
  campaign_type: 'cross_sell',
  status: 'draft',
  source_apps: [],
  target_apps: [],
  placement_zones: ['sidebar'],
  start_date: '',
  end_date: '',
  budget: 0,
  daily_budget_cap: 0,
  headline: '',
  body: '',
  cta_text: 'Learn More',
  destination_url: '',
  priority: 5,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSubmit,
  apps,
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>(INITIAL_FORM_DATA);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
      setStep(1);
      setErrors({});
    }
  }, [isOpen]);

  // Handle field changes
  const handleChange = (field: keyof CampaignFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Toggle array field values
  const toggleArrayField = (field: 'source_apps' | 'target_apps' | 'placement_zones', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
      if (!formData.campaign_type) newErrors.campaign_type = 'Campaign type is required';
    }

    if (step === 2) {
      if (formData.campaign_type === 'cross_sell') {
        if (formData.source_apps.length === 0) newErrors.source_apps = 'Select at least one source app';
        if (formData.target_apps.length === 0) newErrors.target_apps = 'Select at least one target app';
      }
      if (formData.placement_zones.length === 0) newErrors.placement_zones = 'Select at least one placement zone';
    }

    if (step === 3) {
      if (!formData.headline.trim()) newErrors.headline = 'Headline is required';
      if (!formData.body.trim()) newErrors.body = 'Body text is required';
      if (!formData.cta_text.trim()) newErrors.cta_text = 'CTA text is required';
      if (!formData.destination_url.trim()) newErrors.destination_url = 'Destination URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate steps
  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      setErrors({ submit: 'Failed to create campaign. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Campaign
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Step {step} of 4
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Campaign Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g., Summer Cross-Sell Promotion"
                        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Brief description of the campaign goals..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Campaign Type *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'cross_sell', label: 'Cross-Sell', icon: '🔗', description: 'Promote your apps to each other' },
                          { value: 'third_party', label: 'Third-Party', icon: '📢', description: 'Advertiser campaigns' },
                          { value: 'internal', label: 'Internal', icon: '🏠', description: 'Company announcements' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleChange('campaign_type', type.value)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              formData.campaign_type === type.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-2xl">{type.icon}</span>
                            <p className="font-medium text-gray-900 dark:text-white mt-2">{type.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Targeting */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Targeting & Placement
                  </h3>
                  
                  <div className="space-y-6">
                    {formData.campaign_type === 'cross_sell' && (
                      <>
                        {/* Source Apps */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Source Apps * <span className="font-normal text-gray-500">(Where to show the promotion)</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {apps.map((app) => (
                              <button
                                key={app.app_id}
                                type="button"
                                onClick={() => toggleArrayField('source_apps', app.app_id)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                  formData.source_apps.includes(app.app_id)
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {app.icon_url ? (
                                    <img src={app.icon_url} alt="" className="w-6 h-6 rounded" />
                                  ) : (
                                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                      {app.name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {app.name}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                          {errors.source_apps && <p className="mt-2 text-sm text-red-500">{errors.source_apps}</p>}
                        </div>

                        {/* Target Apps */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Target Apps * <span className="font-normal text-gray-500">(Apps to promote)</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {apps.filter((app) => !formData.source_apps.includes(app.app_id)).map((app) => (
                              <button
                                key={app.app_id}
                                type="button"
                                onClick={() => toggleArrayField('target_apps', app.app_id)}
                                className={`p-3 rounded-lg border text-left transition-all ${
                                  formData.target_apps.includes(app.app_id)
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {app.icon_url ? (
                                    <img src={app.icon_url} alt="" className="w-6 h-6 rounded" />
                                  ) : (
                                    <div className="w-6 h-6 rounded bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                      {app.name.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {app.name}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                          {errors.target_apps && <p className="mt-2 text-sm text-red-500">{errors.target_apps}</p>}
                        </div>
                      </>
                    )}

                    {/* Placement Zones */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Placement Zones *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PLACEMENT_ZONES.map((zone) => (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => toggleArrayField('placement_zones', zone.id)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              formData.placement_zones.includes(zone.id)
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                            }`}
                          >
                            <p className="font-medium text-gray-900 dark:text-white">{zone.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{zone.description}</p>
                          </button>
                        ))}
                      </div>
                      {errors.placement_zones && <p className="mt-2 text-sm text-red-500">{errors.placement_zones}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Creative */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Creative Content
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Headline *
                      </label>
                      <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => handleChange('headline', e.target.value)}
                        placeholder="e.g., Boost Your Productivity"
                        maxLength={60}
                        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 border ${errors.headline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      />
                      <p className="mt-1 text-xs text-gray-500">{formData.headline.length}/60 characters</p>
                      {errors.headline && <p className="text-sm text-red-500">{errors.headline}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Body Text *
                      </label>
                      <textarea
                        value={formData.body}
                        onChange={(e) => handleChange('body', e.target.value)}
                        placeholder="Describe the value proposition..."
                        maxLength={200}
                        rows={3}
                        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 border ${errors.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none`}
                      />
                      <p className="mt-1 text-xs text-gray-500">{formData.body.length}/200 characters</p>
                      {errors.body && <p className="text-sm text-red-500">{errors.body}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          CTA Button Text *
                        </label>
                        <input
                          type="text"
                          value={formData.cta_text}
                          onChange={(e) => handleChange('cta_text', e.target.value)}
                          placeholder="e.g., Try It Free"
                          maxLength={25}
                          className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 border ${errors.cta_text ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                        />
                        {errors.cta_text && <p className="mt-1 text-sm text-red-500">{errors.cta_text}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Priority (1-10)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={formData.priority}
                          onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Destination URL *
                      </label>
                      <input
                        type="url"
                        value={formData.destination_url}
                        onChange={(e) => handleChange('destination_url', e.target.value)}
                        placeholder="https://app.craudiovizai.com/..."
                        className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 border ${errors.destination_url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                      />
                      {errors.destination_url && <p className="mt-1 text-sm text-red-500">{errors.destination_url}</p>}
                    </div>

                    {/* Preview */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                      <p className="text-xs text-gray-500 mb-3">PREVIEW</p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {formData.headline || 'Your Headline Here'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formData.body || 'Your body text will appear here...'}
                        </p>
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                          {formData.cta_text || 'Learn More'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Schedule & Budget */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Schedule & Budget
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Campaign Status
                      </label>
                      <div className="flex gap-3">
                        {[
                          { value: 'draft', label: 'Save as Draft', icon: '📝' },
                          { value: 'active', label: 'Launch Now', icon: '🚀' },
                          { value: 'scheduled', label: 'Schedule', icon: '📅' },
                        ].map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() => handleChange('status', status.value)}
                            className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                              formData.status === status.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-xl">{status.icon}</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{status.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.status === 'scheduled' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Total Budget ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={formData.budget || ''}
                          onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                          placeholder="0 = unlimited"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-500">Leave at 0 for unlimited budget</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Daily Cap ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={10}
                          value={formData.daily_budget_cap || ''}
                          onChange={(e) => handleChange('daily_budget_cap', parseFloat(e.target.value) || 0)}
                          placeholder="0 = no daily cap"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                        <p className="mt-1 text-xs text-gray-500">Maximum daily spend</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Campaign Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Name:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{formData.campaign_type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Placements:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.placement_zones.length} zones</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{formData.status}</span>
                        </div>
                        {formData.budget > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Budget:</span>
                            <span className="font-medium text-gray-900 dark:text-white">${formData.budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
            <button
              onClick={step === 1 ? onClose : handleBack}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </button>
            
            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}
            
            <button
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : step === 4 ? (
                <>Create Campaign</>
              ) : (
                <>Next →</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
