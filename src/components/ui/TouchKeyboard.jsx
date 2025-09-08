import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

/**
 * TouchKeyboard Component
 * Virtual keyboard for kiosk input with multiple layouts
 */
const TouchKeyboard = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onClear,
  onClose,
  layout = 'qwerty',
  showNumbers = true,
  showSymbols = false,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLayout, setCurrentLayout] = useState(layout);
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);

  // Layout definitions
  const layouts = {
    qwerty: {
      rows: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      ],
    },
    numeric: {
      rows: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['0', '.', '-'],
      ],
    },
    symbols: {
      rows: [
        ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
        ['-', '_', '=', '+', '[', ']', '{', '}', '\\', '|'],
        [';', ':', '"', "'", ',', '.', '<', '>', '/', '?'],
      ],
    },
  };

  // Get current layout
  const getCurrentLayout = () => {
    return layouts[currentLayout] || layouts.qwerty;
  };

  // Handle key press
  const handleKeyPress = useCallback(
    key => {
      let outputKey = key;

      // Handle shift and caps
      if (isShift || isCaps) {
        if (key >= 'a' && key <= 'z') {
          outputKey = key.toUpperCase();
        }
      }

      onKeyPress?.(outputKey);

      // Reset shift after key press
      if (isShift) {
        setIsShift(false);
      }
    },
    [isShift, isCaps, onKeyPress]
  );

  // Handle special keys
  const handleSpecialKey = useCallback(
    action => {
      switch (action) {
        case 'backspace':
          onBackspace?.();
          break;
        case 'enter':
          onEnter?.();
          break;
        case 'clear':
          onClear?.();
          break;
        case 'space':
          onKeyPress?.(' ');
          break;
        case 'shift':
          setIsShift(!isShift);
          break;
        case 'caps':
          setIsCaps(!isCaps);
          break;
        case 'close':
          onClose?.();
          break;
        default:
          break;
      }
    },
    [isShift, isCaps, onBackspace, onEnter, onClear, onKeyPress, onClose]
  );

  // Handle layout change
  const handleLayoutChange = newLayout => {
    setCurrentLayout(newLayout);
    setIsShift(false);
    setIsCaps(false);
  };

  // Show/hide keyboard
  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  // Expose methods
  useEffect(() => {
    if (props.ref) {
      props.ref.current = { show, hide };
    }
  }, [props.ref]);

  if (!isVisible) return null;

  const currentLayoutData = getCurrentLayout();

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end',
        className
      )}
      {...props}
    >
      <div className="w-full bg-white rounded-t-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <Button
              variant={currentLayout === 'qwerty' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleLayoutChange('qwerty')}
            >
              ABC
            </Button>
            {showNumbers && (
              <Button
                variant={currentLayout === 'numeric' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('numeric')}
              >
                123
              </Button>
            )}
            {showSymbols && (
              <Button
                variant={currentLayout === 'symbols' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('symbols')}
              >
                #+=
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSpecialKey('close')}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Keyboard */}
        <div className="p-4">
          {currentLayoutData.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-1 mb-2">
              {row.map(key => (
                <Button
                  key={key}
                  variant="outline"
                  size="lg"
                  className="min-w-[44px] min-h-[44px] text-lg font-medium"
                  onClick={() => handleKeyPress(key)}
                >
                  {key}
                </Button>
              ))}
            </div>
          ))}

          {/* Special keys row */}
          <div className="flex justify-center space-x-1 mt-2">
            {currentLayout === 'qwerty' && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[44px] min-h-[44px]"
                  onClick={() => handleSpecialKey('shift')}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[44px] min-h-[44px]"
                  onClick={() => handleSpecialKey('caps')}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="lg"
              className="flex-1 max-w-[200px] min-h-[44px]"
              onClick={() => handleSpecialKey('space')}
            >
              Space
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="min-w-[44px] min-h-[44px]"
              onClick={() => handleSpecialKey('backspace')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="min-w-[44px] min-h-[44px]"
              onClick={() => handleSpecialKey('enter')}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TouchKeyboardInput Component
 * Input field with integrated touch keyboard
 */
const TouchKeyboardInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Tap to type',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardRef, setKeyboardRef] = useState(null);

  const handleFocus = e => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = e => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleKeyPress = key => {
    onChange?.(value + key);
  };

  const handleBackspace = () => {
    onChange?.(value.slice(0, -1));
  };

  const handleEnter = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange?.('');
  };

  const handleClose = () => {
    setIsFocused(false);
  };

  return (
    <div className={cn('relative', className)} {...props}>
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[48px]"
        readOnly
      />

      {isFocused && (
        <TouchKeyboard
          ref={setKeyboardRef}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onClear={handleClear}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

/**
 * useTouchKeyboard Hook
 * Hook for managing touch keyboard state
 */
export const useTouchKeyboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('qwerty');

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);

  const setLayout = useCallback(layout => {
    setCurrentLayout(layout);
  }, []);

  return {
    isVisible,
    currentLayout,
    show,
    hide,
    toggle,
    setLayout,
  };
};

export default TouchKeyboard;
export { TouchKeyboardInput };
