export const DetailItem = ({ icon: Icon, label, value, highlight = false }) => (
    <div className="flex flex-col">
        <div className="flex items-center text-sm text-gray-500 font-medium mb-1">
            <Icon className="w-4 h-4 mr-1" />
            {label}
        </div>
        <p className={`text-lg font-semibold ${highlight ? 'text-blue-700' : 'text-gray-800'} break-all`}>
            {value}
        </p>
    </div>
);