import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={`inline-flex items-center font-semibold gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-500 font-normal">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
};




// import React from 'react';
// import { motion } from 'motion/react';
// import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

// interface StatCardProps {
//   title: string;
//   value: string | number;
//   subtitle?: string;
//   trend?: {
//     value: string;
//     isPositive: boolean;
//   };
//   icon: LucideIcon;
//   iconBgColor?: string;
//   iconTextColor?: string;
// }

// export const StatCard: React.FC<StatCardProps> = ({
//   title,
//   value,
//   subtitle,
//   trend,
//   icon: Icon,
//   iconBgColor = 'bg-slate-100',
//   iconTextColor = 'text-slate-700',
// }) => {
//   return (
//     <motion.div
//       whileHover={{ y: -2 }}
//       transition={{ duration: 0.2 }}
//       className="
//         group
//         bg-white
//         border border-slate-200
//         rounded-xl
//         p-5
//         shadow-sm
//         hover:shadow-md
//         transition-shadow
//       "
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between gap-4">
//         <div className="min-w-0">
//           <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
//             {title}
//           </p>

//           <div className="mt-2 text-[26px] leading-none font-bold tracking-tight text-slate-950">
//             {value}
//           </div>
//         </div>

//         {/* Icon */}
//         <div
//           className={`
//             shrink-0
//             w-10 h-10
//             rounded-lg
//             ${iconBgColor}
//             ${iconTextColor}
//             flex items-center justify-center
//             border border-slate-100
//           `}
//         >
//           <Icon className="w-[18px] h-[18px]" />
//         </div>
//       </div>

//       {/* Bottom information */}
//       {(trend || subtitle) && (
//         <div className="mt-5 pt-3 border-t border-slate-100">
//           {trend && (
//             <div
//               className={`
//                 inline-flex items-center gap-1.5
//                 text-xs font-semibold
//                 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}
//               `}
//             >
//               {trend.isPositive ? (
//                 <TrendingUp className="w-3.5 h-3.5" />
//               ) : (
//                 <TrendingDown className="w-3.5 h-3.5" />
//               )}

//               <span>{trend.value}</span>
//             </div>
//           )}

//           {subtitle && (
//             <div className="mt-1 text-xs text-slate-500">
//               {subtitle}
//             </div>
//           )}
//         </div>
//       )}
//     </motion.div>
//   );
// };