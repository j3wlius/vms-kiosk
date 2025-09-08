// import React from 'react';
// import { cn } from '../../utils/cn';

/**
 * ProgressBar Component
 * Linear and circular progress indicators
 */
// const ProgressBar = ({
//   value = 0,
//   max = 100,
//   size = 'md',
//   variant = 'default',
//   showLabel = false,
//   label,
//   className = '',
//   ...props
// }) => {
//   const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

//   const sizes = {
//     sm: 'h-1',
//     md: 'h-2',
//     lg: 'h-3',
//     xl: 'h-4',
//   };

//   const variants = {
//     default: 'bg-blue-600',
//     success: 'bg-green-600',
//     warning: 'bg-yellow-600',
//     danger: 'bg-red-600',
//     primary: 'bg-blue-600',
//     secondary: 'bg-gray-600',
//   };

//   const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';
//   const progressClasses = cn(
//     'h-full transition-all duration-300 ease-in-out rounded-full',
//     variants[variant]
//   );

//   return (
//     <div className={cn('w-full', className)} {...props}>
//       {showLabel && (
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-sm font-medium text-gray-700 kiosk-text">
//             {label || 'Progress'}
//           </span>
//           <span className="text-sm text-gray-500 kiosk-text">
//             {Math.round(percentage)}%
//           </span>
//         </div>
//       )}

//       <div className={cn(baseClasses, sizes[size])}>
//         <div
//           className={progressClasses}
//           style={{ width: `${percentage}%` }}
//           role="progressbar"
//           aria-valuenow={value}
//           aria-valuemin={0}
//           aria-valuemax={max}
//           aria-label={label || 'Progress'}
//         />
//       </div>
//     </div>
//   );
// };

/**
 * Circular Progress Component
 */
// const CircularProgress = ({
//   value = 0,
//   max = 100,
//   size = 'md',
//   variant = 'default',
//   showLabel = false,
//   label,
//   strokeWidth = 2,
//   className = '',
//   ...props
// }) => {
//   const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
//   const radius = 50 - strokeWidth / 2;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDasharray = circumference;
//   const strokeDashoffset = circumference - (percentage / 100) * circumference;

//   const sizes = {
//     sm: 'w-8 h-8',
//     md: 'w-12 h-12',
//     lg: 'w-16 h-16',
//     xl: 'w-20 h-20',
//   };

//   const variants = {
//     default: 'text-blue-600',
//     success: 'text-green-600',
//     warning: 'text-yellow-600',
//     danger: 'text-red-600',
//     primary: 'text-blue-600',
//     secondary: 'text-gray-600',
//   };

  // return (
  //   <div
  //     className={cn(
  //       'relative inline-flex items-center justify-center',
  //       className
  //     )}
  //     {...props}
  //   >
  //     <svg
  //       className={cn('transform -rotate-90', sizes[size])}
  //       viewBox="0 0 100 100"
  //     >
        {/* Background circle */}
        // <circle
        //   cx="50"
        //   cy="50"
        //   r={radius}
        //   stroke="currentColor"
        //   strokeWidth={strokeWidth}
        //   fill="transparent"
        //   className="text-gray-200"
        // />

        {/* Progress circle */}
//         <circle
//           cx="50"
//           cy="50"
//           r={radius}
//           stroke="currentColor"
//           strokeWidth={strokeWidth}
//           fill="transparent"
//           strokeDasharray={strokeDasharray}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           className={cn(
//             'transition-all duration-300 ease-in-out',
//             variants[variant]
//           )}
//         />
//       </svg>

//       {showLabel && (
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className="text-xs font-medium text-gray-700 kiosk-text">
//             {Math.round(percentage)}%
//           </span>
//         </div>
//       )}

//       {label && (
//         <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
//           <span className="text-xs text-gray-600 kiosk-text whitespace-nowrap">
//             {label}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// };

/**
 * Step Progress Component
 */
// const StepProgress = ({
//   steps = [],
//   currentStep = 0,
//   variant = 'default',
//   className = '',
//   ...props
// }) => {
//   const variants = {
//     default: {
//       completed: 'bg-blue-600 text-white',
//       current: 'bg-blue-100 text-blue-600 border-blue-600',
//       pending: 'bg-gray-100 text-gray-400 border-gray-300',
//     },
//     success: {
//       completed: 'bg-green-600 text-white',
//       current: 'bg-green-100 text-green-600 border-green-600',
//       pending: 'bg-gray-100 text-gray-400 border-gray-300',
//     },
//   };

//   const getStepStatus = index => {
//     if (index < currentStep) return 'completed';
//     if (index === currentStep) return 'current';
//     return 'pending';
//   };

//   return (
//     <div className={cn('flex items-center', className)} {...props}>
//       {steps.map((step, index) => {
//         const status = getStepStatus(index);
//         const isLast = index === steps.length - 1;

//         return (
//           <React.Fragment key={index}>
//             <div className="flex items-center">
//               <div
//                 className={cn(
//                   'flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium text-sm transition-all duration-200',
//                   variants[variant][status]
//                 )}
//               >
//                 {status === 'completed' ? (
//                   <svg
//                     className="w-4 h-4"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 ) : (
//                   index + 1
//                 )}
//               </div>

//               {step.label && (
//                 <div className="ml-2">
//                   <p
//                     className={cn(
//                       'text-sm font-medium transition-colors',
//                       status === 'completed'
                        // ? 'text-gray-900'
//                         : status === 'current'
                          // ? 'text-blue-600'
//                           : 'text-gray-400'
//                     )}
//                   >
//                     {step.label}
//                   </p>
//                   {step.description && (
//                     <p className="text-xs text-gray-500 kiosk-text">
//                       {step.description}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>

//             {!isLast && (
//               <div
//                 className={cn(
//                   'flex-1 h-0.5 mx-4 transition-colors',
//                   index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
//                 )}
//               />
//             )}
//           </React.Fragment>
//         );
//       })}
//     </div>
//   );
// };

// ProgressBar.Circular = CircularProgress;
// ProgressBar.Steps = StepProgress;

// export default ProgressBar;

