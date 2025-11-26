// ============================================================================
// CR AUDIOVIZ AI - CREATE A/B TEST MODAL
// Modal for creating new A/B tests
// Created: 2025-11-25
// Version: 1.0.0
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ABTestFormData {
  name: string;
  description: string;
  test_type: 'headline' | 'cta' | 'image' | 'placement' | 'custom';
  variant_a: {
    name: string;
    headline?: string;
    body?: string;
    cta_text?: string;
    image_url?: string;
  };
  variant_b: {
    name: string;
    headline?: string;
    body?: string;
    cta_text?: string;
    image_url?: string;
  };
  target_sample_size: number;
  min_confidence: number;
  auto_end: boolean;
  source_campaign_id?: string;
}

interface Campaign {
  campaign_id: string;
  name: string;
}

interface CreateABTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ABTestFormData) => Promise<void>;
  campaigns: Campaign[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TEST_TYPES = [
  { value: 'headline', label: 'Headline Test', icon: '📝', description: 'Test different headlines' },
  { value: 'cta', label: 'CTA Test', icon: '🔘', description: 'Test button text/colors' },
  { value: 'image', label: 'Image Test', icon: '🖼️', description: 'Test different images' },
  { value: 'placement', label: 'Placement Test', icon: '📍', description: 'Test ad placements' },
  { value: 'custom', label: 'Custom Test', icon: '⚙️', description: 'Full creative control' },
];

const INITIAL_FORM_DATA: ABTestFormData = {
  name: '',
  description: '',
  test_type: 'headline',
  variant_a: { name: 'Control' },
  variant_b: { name: 'Variant B' },
  target_sample_size: 10000,
  min_confidence: 95,
  auto_end: true,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function CreateABTestModal({
  isOpen,
  onClose,
  onSubmit,
  campaigns,
}: CreateABTestModalProps) {
  const [formData, setFormData] = useState<ABTestFormData>(INITIAL_FORM_DATA);
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
  const handleChange = (field: keyof ABTestFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Handle variant changes
  const handleVariantChange = (
    variant: 'variant_a' | 'variant_b',
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [variant]: { ...prev[variant], [field]: value },
    }));
  };

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Test name is required';
      if (!formData.test_type) newErrors.test_type = 'Test type is required';
    }

    if (step === 2) {
      if (!formData.variant_a.name.trim()) newErrors.variant_a_name = 'Variant A name is required';
      if (!formData.variant_b.name.trim()) newErrors.variant_b_name = 'Variant B name is required';
      
      if (formData.test_type === 'headline') {
        if (!formData.variant_a.headline?.trim()) newErrors.variant_a_headline = 'Headline A is required';
        if (!formData.variant_b.headline?.trim()) newErrors.variant_b_headline = 'Headline B is required';
      }
      
      if (formData.test_type === 'cta') {
        if (!formData.variant_a.cta_text?.trim()) newErrors.variant_a_cta = 'CTA A is required';
        if (!formData.variant_b.cta_text?.trim()) newErrors.variant_b_cta = 'CTA B is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate steps
  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, 3));
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
      console.error('Failed to create A/B test:', error);
      setErrors({ submit: 'Failed to create test. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create A/B Test
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Homepage CTA Color Test"
                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-700 border ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg focus:ring-2 focus:ring-purple-500`}
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
                    placeholder="What are you testing and why?"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Test Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TEST_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleChange('test_type', type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.test_type === type.value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <p className="font-medium text-gray-900 dark:text-white mt-2">{type.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {campaigns.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Source Campaign (Optional)
                    </label>
                    <select
                      value={formData.source_campaign_id || ''}
                      onChange={(e) => handleChange('source_campaign_id', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">No source campaign</option>
                      {campaigns.map((c) => (
                        <option key={c.campaign_id} value={c.campaign_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Variants */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Variant A */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">Control</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Variant Name
                        </label>
                        <input
                          type="text"
                          value={formData.variant_a.name}
                          onChange={(e) => handleVariantChange('variant_a', 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>

                      {(formData.test_type === 'headline' || formData.test_type === 'custom') && (
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Headline
                          </label>
                          <input
                            type="text"
                            value={formData.variant_a.headline || ''}
                            onChange={(e) => handleVariantChange('variant_a', 'headline', e.target.value)}
                            placeholder="Original headline"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                              errors.variant_a_headline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg text-sm`}
                          />
                        </div>
                      )}

                      {(formData.test_type === 'cta' || formData.test_type === 'custom') && (
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            CTA Text
                          </label>
                          <input
                            type="text"
                            value={formData.variant_a.cta_text || ''}
                            onChange={(e) => handleVariantChange('variant_a', 'cta_text', e.target.value)}
                            placeholder="Button text"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                              errors.variant_a_cta ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg text-sm`}
                          />
                        </div>
                      )}

                      {formData.test_type === 'custom' && (
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Body Text
                          </label>
                          <textarea
                            value={formData.variant_a.body || ''}
                            onChange={(e) => handleVariantChange('variant_a', 'body', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant B */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        B
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">Challenger</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Variant Name
                        </label>
                        <input
                          type="text"
                          value={formData.variant_b.name}
                          onChange={(e) => handleVariantChange('variant_b', 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>

                      {(formData.test_type === 'headline' || formData.test_type === 'custom') && (
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Headline
                          </label>
                          <input
                            type="text"
                            value={formData.variant_b.headline || ''}
                            onChange={(e) => handleVariantChange('variant_b', 'headline', e.target.value)}
                            placeholder="New headline to test"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                              errors.variant_b_headline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg text-sm`}
                          />
                        </div>
                      )}

                      {(formData.test_type === 'cta' || formData.test_type === 'custom') && (
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            CTA Text
                          </label>
                          <input
                            type="text"
                            value={formData.variant_b.cta_text || ''}
                            onChange={(e) => handleVariantChange('variant_b', 'cta_text', e.target.value)}
                            placeholder="New button text"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
                              errors.variant_b_cta ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } rounded-lg text-sm`}
                          />
                        </div>
                      )}

                      {formData.test_type === 'custom' && (
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Body Text
                          </label>
                          <textarea
                            value={formData.variant_b.body || ''}
                            onChange={(e) => handleVariantChange('variant_b', 'body', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Target Sample Size
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={formData.target_sample_size}
                      onChange={(e) => handleChange('target_sample_size', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-24 text-right font-medium text-gray-900 dark:text-white">
                      {formData.target_sample_size.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Total impressions needed per variant before declaring a winner
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Minimum Confidence Level
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={80}
                      max={99}
                      value={formData.min_confidence}
                      onChange={(e) => handleChange('min_confidence', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-medium text-gray-900 dark:text-white">
                      {formData.min_confidence}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Statistical confidence required to declare a winner (95% recommended)
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Auto-End Test</p>
                    <p className="text-sm text-gray-500">
                      Automatically end when significance is reached
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.auto_end}
                      onChange={(e) => handleChange('auto_end', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Summary */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">Test Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Test Name:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">{formData.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Type:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100 capitalize">
                        {formData.test_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Sample Size:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">
                        {formData.target_sample_size.toLocaleString()} per variant
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700 dark:text-purple-300">Confidence:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">{formData.min_confidence}%</span>
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
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </button>

            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : step === 3 ? (
                'Start Test'
              ) : (
                'Next →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
