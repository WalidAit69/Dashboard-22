import { useState, useEffect } from 'react';
import { X, BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import { CertificatService } from '../../utils/CertificatService';

const StatistiquesCertificats = ({ isOpen, onClose }) => {
    const [statistiques, setStatistiques] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadStatistiques();
        }
    }, [isOpen]);

    const loadStatistiques = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await CertificatService.getStatistiques();
            setStatistiques(data);
        } catch (err) {
            setError('Erreur lors du chargement des statistiques');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getProgressBarColor = (statut) => {
        switch (statut) {
            case 'valides':
                return 'bg-green-500';
            case 'expirants':
                return 'bg-orange-500';
            case 'expires':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Statistiques des certificats
                        </h2>
                        <p className="text-sm text-gray-500">
                            Vue d'ensemble des certificats par type et organisme
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

            <div className="p-6 max-h-[80vh] overflow-y-auto">
                {error ? (
                    <div className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadStatistiques}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : !statistiques ? (
                    <div className="text-center py-8">
                        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
                        <p className="text-gray-500">Les statistiques ne sont pas disponibles pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Vue d'ensemble */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-600 text-sm font-medium">Total</p>
                                        <p className="text-2xl font-bold text-blue-900">{statistiques.totalCertificats}</p>
                                    </div>
                                    <BarChart3 className="text-blue-500" size={24} />
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-600 text-sm font-medium">Valides</p>
                                        <p className="text-2xl font-bold text-green-900">{statistiques.certificatsValides}</p>
                                        <p className="text-xs text-green-600">{statistiques.pourcentageValides}%</p>
                                    </div>
                                    <CheckCircle className="text-green-500" size={24} />
                                </div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-600 text-sm font-medium">Expirants</p>
                                        <p className="text-2xl font-bold text-orange-900">{statistiques.certificatsExpirants}</p>
                                    </div>
                                    <AlertTriangle className="text-orange-500" size={24} />
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-red-600 text-sm font-medium">Expirés</p>
                                        <p className="text-2xl font-bold text-red-900">{statistiques.certificatsExpires}</p>
                                    </div>
                                    <XCircle className="text-red-500" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Graphique global */}
                        <div className="bg-white p-6 border rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart size={18} />
                                Répartition des statuts
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Valides</span>
                                    <span className="text-sm font-medium">{statistiques.certificatsValides}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${statistiques.pourcentageValides}%` }}
                                    ></div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-gray-600">Expirants</span>
                                    <span className="text-sm font-medium">{statistiques.certificatsExpirants}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${statistiques.totalCertificats > 0 ? 
                                                (statistiques.certificatsExpirants * 100 / statistiques.totalCertificats) : 0}%` 
                                        }}
                                    ></div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-gray-600">Expirés</span>
                                    <span className="text-sm font-medium">{statistiques.certificatsExpires}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${statistiques.totalCertificats > 0 ? 
                                                (statistiques.certificatsExpires * 100 / statistiques.totalCertificats) : 0}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Par type de certificat */}
                            <div className="bg-white p-6 border rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={18} />
                                    Par type de certificat
                                </h3>
                                <div className="space-y-4">
                                    {statistiques.certificatsParType?.map((type, index) => (
                                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {type.typeCertificat}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {type.nombre} certificats
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span>Valides: {type.valides}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                    <span>Expirants: {type.expirants}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    <span>Expirés: {type.expires}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-500 text-sm">Aucune donnée disponible</p>}
                                </div>
                            </div>

                            {/* Par organisme */}
                            <div className="bg-white p-6 border rounded-lg">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} />
                                    Par organisme de certification
                                </h3>
                                <div className="space-y-4">
                                    {statistiques.certificatsParOrganisme?.map((organisme, index) => (
                                        <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {organisme.nomOrganisme}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {organisme.nombre} certificats
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">
                                                    Taux de réussite moyen
                                                </span>
                                                <span className="text-sm font-medium text-blue-600">
                                                    {organisme.tauxReussiteMoyen?.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )) || <p className="text-gray-500 text-sm">Aucune donnée disponible</p>}
                                </div>
                            </div>
                        </div>
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

export default StatistiquesCertificats;