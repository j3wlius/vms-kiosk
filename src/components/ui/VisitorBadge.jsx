import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { useAtomValue } from 'jotai';
import { visitorBadgeDataAtom } from '../../stores/atoms/visitorAtoms';

/**
 * VisitorBadge Component
 * Badge template with QR code generation and company branding
 */
const VisitorBadge = ({
  visitorData,
  template = 'default',
  size = 'standard',
  showQR = true,
  showCompanyLogo = true,
  className = '',
  ...props
}) => {
  const badgeData = useAtomValue(visitorBadgeDataAtom);
  const data = visitorData || badgeData;
  const canvasRef = useRef(null);
  const [qrCode, setQrCode] = useState(null);

  // Generate QR code
  useEffect(() => {
    if (showQR && data?.qrCode) {
      // In a real implementation, you would use a QR code library like qrcode
      // For now, we'll create a placeholder
      setQrCode(data.qrCode);
    }
  }, [data?.qrCode, showQR]);

  // Badge templates
  const templates = {
    default: {
      name: 'Default',
      layout: 'horizontal',
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        text: '#1F2937',
        background: '#FFFFFF',
      },
    },
    corporate: {
      name: 'Corporate',
      layout: 'vertical',
      colors: {
        primary: '#1F2937',
        secondary: '#374151',
        text: '#1F2937',
        background: '#F9FAFB',
      },
    },
    modern: {
      name: 'Modern',
      layout: 'horizontal',
      colors: {
        primary: '#7C3AED',
        secondary: '#5B21B6',
        text: '#1F2937',
        background: '#FFFFFF',
      },
    },
  };

  // Badge sizes
  const sizes = {
    small: {
      width: 200,
      height: 120,
      fontSize: {
        name: 'text-sm',
        company: 'text-xs',
        date: 'text-xs',
        host: 'text-xs',
      },
    },
    standard: {
      width: 300,
      height: 180,
      fontSize: {
        name: 'text-lg',
        company: 'text-sm',
        date: 'text-sm',
        host: 'text-sm',
      },
    },
    large: {
      width: 400,
      height: 240,
      fontSize: {
        name: 'text-xl',
        company: 'text-base',
        date: 'text-base',
        host: 'text-base',
      },
    },
  };

  const currentTemplate = templates[template] || templates.default;
  const currentSize = sizes[size] || sizes.standard;

  if (!data) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 rounded-lg',
          className
        )}
        {...props}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p className="text-sm">No visitor data</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg shadow-lg', className)}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        backgroundColor: currentTemplate.colors.background,
      }}
      {...props}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {showCompanyLogo && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
            )}
            <div>
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Visitor Badge
              </h3>
            </div>
          </div>

          {showQR && qrCode && (
            <div className="w-12 h-12 bg-white rounded border-2 border-gray-200 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-900 rounded grid grid-cols-4 gap-0.5">
                {/* QR Code placeholder - in real implementation, use a QR code library */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-white ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-4">
            <h2
              className={cn(
                'font-bold text-gray-900 mb-1',
                currentSize.fontSize.name
              )}
            >
              {data.name || 'Visitor Name'}
            </h2>

            <p
              className={cn('text-gray-600 mb-2', currentSize.fontSize.company)}
            >
              {data.company || 'Company Name'}
            </p>

            <div className="space-y-1">
              <p className={cn('text-gray-500', currentSize.fontSize.date)}>
                {data.visitDate
                  ? new Date(data.visitDate).toLocaleDateString()
                  : 'Today'}
              </p>

              <p className={cn('text-gray-500', currentSize.fontSize.host)}>
                Host: {data.hostName || 'Host Name'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>ID: {data.id || 'N/A'}</span>
            <span>{data.visitTime || new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * BadgePreview Component
 * Preview component for badge before printing
 */
const BadgePreview = ({
  visitorData,
  template = 'default',
  size = 'standard',
  onPrint,
  onEdit,
  className = '',
  ...props
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await onPrint?.();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Badge Preview
        </h3>
        <p className="text-sm text-gray-600">
          Review your visitor badge before printing
        </p>
      </div>

      <div className="flex justify-center">
        <VisitorBadge
          visitorData={visitorData}
          template={template}
          size={size}
        />
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit
        </button>

        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isPrinting ? 'Printing...' : 'Print Badge'}
        </button>
      </div>
    </div>
  );
};

/**
 * BadgeTemplateSelector Component
 * Template selection for badge customization
 */
const BadgeTemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
  className = '',
  ...props
}) => {
  const templates = [
    { id: 'default', name: 'Default', preview: 'bg-blue-500' },
    { id: 'corporate', name: 'Corporate', preview: 'bg-gray-700' },
    { id: 'modern', name: 'Modern', preview: 'bg-purple-500' },
  ];

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <h3 className="text-lg font-semibold text-gray-900">
        Choose Badge Template
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={cn(
              'p-4 border-2 rounded-lg text-center transition-all duration-200',
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div
              className={cn('w-16 h-10 mx-auto mb-2 rounded', template.preview)}
            />
            <p className="text-sm font-medium text-gray-900">{template.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * BadgePrintQueue Component
 * Print queue management for multiple badges
 */
const BadgePrintQueue = ({
  badges = [],
  onPrintAll,
  onPrintSingle,
  onRemove,
  className = '',
  ...props
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintAll = async () => {
    setIsPrinting(true);
    try {
      await onPrintAll?.(badges);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintSingle = async badge => {
    await onPrintSingle?.(badge);
  };

  const handleRemove = badgeId => {
    onRemove?.(badgeId);
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Print Queue ({badges.length})
        </h3>

        {badges.length > 0 && (
          <button
            onClick={handlePrintAll}
            disabled={isPrinting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPrinting ? 'Printing...' : 'Print All'}
          </button>
        )}
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p>No badges in queue</p>
        </div>
      ) : (
        <div className="space-y-2">
          {badges.map(badge => (
            <div
              key={badge.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <VisitorBadge visitorData={badge} size="small" showQR={false} />

                <div>
                  <p className="font-medium text-gray-900">{badge.name}</p>
                  <p className="text-sm text-gray-500">
                    {badge.company} • {badge.visitDate}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handlePrintSingle(badge)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Print
                </button>

                <button
                  onClick={() => handleRemove(badge.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisitorBadge;
export { BadgePreview, BadgeTemplateSelector, BadgePrintQueue };

