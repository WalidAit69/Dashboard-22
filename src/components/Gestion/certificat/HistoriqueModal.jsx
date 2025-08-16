import { useState, useEffect } from 'react';
import { X, History, Calendar, User, FileText } from 'lucide-react';
import Modal from '../../ui/Modal';
import { CertificatService } from '../../../utils/CertificatService';

const HistoriqueModal = ({ isOpen, onClose, certificatId }) => {
    const [historique, setHistorique] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && certificatId) {
            loadHistorique();
        }
    }, [isOpen, certificatId]);

    const loadHistorique = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await CertificatService.getHistorique(certificatId);
            setHistorique(data);
        } catch (err) {
            setError('Erreur lors du chargement de l\'historique');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionIcon = (action) => {
        switch (action?.toLowerCase()) {
            case 'creation':
                return <FileText size={16} className="text-green-600" />;
            case 'modification':
                return <FileText size={16} className="text-blue-600" />;
            case 'suppression':
                return <FileText size={16} className="text-red-600" />;
            case 'upload document':
                return <FileText size={16} className="text-purple-600" />;
            default:
                return <FileText size={16} className="text-gray-600" />;
        }
    };

    const getActionColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'creation':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'modification':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'suppression':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'upload document':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <History className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Historique du certificat
                        </h2>
                        <p className="text-sm text-gray-500">
                            Toutes les modifications apportées à ce certificat
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
                {error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadHistorique}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : historique.length === 0 ? (
                    <div className="text-center py-8">
                        <History className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique</h3>
                        <p className="text-gray-500">Aucune modification n'a été enregistrée pour ce certificat.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historique.map((item, index) => (
                            <div key={item.id || index} className="relative">
                                {/* Timeline line */}
                                {index < historique.length - 1 && (
                                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                                )}
                                
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getActionColor(item.action)}`}>
                                        {getActionIcon(item.action)}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900 capitalize">
                                                        {item.action || 'Action inconnue'}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        <Calendar size={12} />
                                                        <span>{formatDate(item.dateAction)}</span>
                                                        {item.utilisateur && (
                                                            <>
                                                                <span>•</span>
                                                                <User size={12} />
                                                                <span>{item.utilisateur}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="mt-3">
                                                {item.nouvelleValeur && (
                                                    <div className="text-sm text-gray-700">
                                                        <span className="font-medium">Détails :</span> {item.nouvelleValeur}
                                                    </div>
                                                )}
                                                
                                                {item.ancienneValeur && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        <span className="font-medium">Ancienne valeur :</span> {item.ancienneValeur}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

export default HistoriqueModal;