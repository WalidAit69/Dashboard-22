import { Loader2, Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmer l'action",
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    confirmButtonClass = "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    loading = false,
    loadingText = "Traitement en cours...",
    type = "danger",
    itemName = null,
    className = "max-w-md mx-auto mt-20"
}) => {
    const getIcon = () => {
        const iconProps = { className: "w-6 h-6" };

        switch (type) {
            case 'danger':
                return <Trash2 {...iconProps} className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle {...iconProps} className="w-6 h-6 text-yellow-600" />;
            case 'info':
                return <Info {...iconProps} className="w-6 h-6 text-blue-600" />;
            case 'success':
                return <CheckCircle {...iconProps} className="w-6 h-6 text-green-600" />;
            default:
                return <AlertTriangle {...iconProps} className="w-6 h-6 text-gray-600" />;
        }
    };

    const getIconBgColor = () => {
        switch (type) {
            case 'danger':
                return "bg-red-100";
            case 'warning':
                return "bg-yellow-100";
            case 'info':
                return "bg-blue-100";
            case 'success':
                return "bg-green-100";
            default:
                return "bg-gray-100";
        }
    };

    const getDefaultConfirmButtonClass = () => {
        switch (type) {
            case 'danger':
                return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
            case 'warning':
                return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
            case 'info':
                return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
            case 'success':
                return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
            default:
                return "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500";
        }
    };

    const finalConfirmButtonClass = confirmButtonClass || getDefaultConfirmButtonClass();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className={className}
            showCloseButton={!loading}
        >
            <div className="p-6">
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 ${getIconBgColor()} rounded-full`}>
                    {getIcon()}
                </div>

                <div className="text-center">
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                        {title}
                    </h3>
                    <div className="mb-6 text-sm text-gray-500">
                        {message && (
                            <p>
                                {typeof message === 'string' ? (
                                    itemName ? (
                                        <>
                                            {message.replace('{itemName}', '')}
                                            <span className="font-medium text-gray-900">{itemName}</span>
                                            {message.includes('{itemName}') && message.split('{itemName}')[1]}
                                        </>
                                    ) : (
                                        message
                                    )
                                ) : (
                                    message
                                )}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${finalConfirmButtonClass}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {loadingText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;