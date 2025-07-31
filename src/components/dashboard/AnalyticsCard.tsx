function AnalyticsCard({ card }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {card.title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="lg:text-2xl text-xl font-semibold text-gray-900">
              {card.value}
            </span>
            <span className={`lg:text-sm text-xs font-medium ${card.changeColor}`}>
              ({card.change})
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${card.iconBg}`}>
          <card.icon className={`w-5 h-5 ${card.iconColor}`} />
        </div>
      </div>
      <p className="text-xs text-gray-500">{card.subtitle}</p>
    </div>
  );
}

export default AnalyticsCard;
