export default function DashboardCard({
    title,
    value,
    subtitle,
    icon,
    iconBg = "bg-blue-100",
    iconColor = "text-blue-600",
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
                {/* Card Content */}
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                        {value}
                    </h3>

                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Icon */}
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
                >
                    <span className="text-xl">
                        {icon}
                    </span>
                </div>
            </div>
        </div>
    );
}