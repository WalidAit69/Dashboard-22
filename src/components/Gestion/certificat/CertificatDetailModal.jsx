import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Building, Download } from 'lucide-react';
import Modal from '../../ui/Modal';
import { CertificatService } from '../../../utils/CertificatService';

const CertificatDetailModal = ({ isOpen, onClose, certificat }) => {
    const [loading, setLoading] = useState(false);
    const [certificatDetails, setCertificatDetails] = useState(null);

    useEffect(() => {
        if (isOpen && certificat) {
            loadCertificatDetails();
        }
    }, [isOpen, certificat]);

    const loadCertificatDetails = async () => {
        try {
            setLoading(true);
            const details = await CertificatService.getCertificat(certificat.idCertificat);
            setCertificatDetails(details);
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const getStatutBadge = (statut, joursRestants) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 w-fit";
        
        switch (statut) {
            case 'Valide':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800`}>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Valide
                    </span>
                );
            case 'Expirant':
                return (
                    <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Expire dans {joursRestants} jours
                    </span>
                );
            case 'Expire':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800`}>
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Expiré
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        {statut}
                    </span>
                );
        }
    };

    const handleDownloadDocument = (document) => {
        // Simuler le téléchargement - à remplacer par la vraie logique
        const link = document.createElement('a');
        link.href = document.cheminFichier;
        link.download = document.nomOriginal;
        link.click();
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

    const cert = certificatDetails || certificat;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Détails du certificat
                        </h2>
                        <p className="text-sm text-gray-500">
                            {cert.numeroCertificat || `ID: ${cert.idCertificat}`}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations générales */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={18} />
                            Informations générales
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Numéro de certificat</label>
                                <p className="text-sm text-gray-900">{cert.numeroCertificat || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Statut</label>
                                <div className="mt-1">
                                    {getStatutBadge(cert.statut, cert.joursRestants)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type de certificat</label>
                                <p className="text-sm text-gray-900">{cert.nomTypeCertificat || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Organisme de certification</label>
                                <p className="text-sm text-gray-900">{cert.nomOrganisme || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Taux de réussite</label>
                                <p className="text-sm text-gray-900">
                                    {cert.tauxReussite ? `${cert.tauxReussite}%` : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Informations verger/producteur */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Building size={18} />
                            Verger & Producteur
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Verger</label>
                                <p className="text-sm text-gray-900">{cert.nomVerger || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Référence verger</label>
                                <p className="text-sm text-gray-900">{cert.refver || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Producteur</label>
                                <p className="text-sm text-gray-900">{cert.nomProducteur || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dates importantes */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={18} />
                            Dates importantes
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date d'obtention</label>
                                <p className="text-sm text-gray-900">{formatDate(cert.dateObtention)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date d'expiration</label>
                                <p className="text-sm text-gray-900 font-medium">
                                    {formatDate(cert.dateExpiration)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date d'audit</label>
                                <p className="text-sm text-gray-900">{formatDate(cert.dateAudit)}</p>
                            </div>
                            {cert.joursRestants !== undefined && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Jours restants</label>
                                    <p className={`text-sm font-medium ${
                                        cert.joursRestants < 0 ? 'text-red-600' : 
                                        cert.joursRestants <= 90 ? 'text-orange-600' : 'text-green-600'
                                    }`}>
                                        {cert.joursRestants < 0 ? 
                                            `Expiré depuis ${Math.abs(cert.joursRestants)} jours` : 
                                            `${cert.joursRestants} jours`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={18} />
                            Documents ({cert.documents?.length || 0})
                        </h3>
                        <div className="space-y-3">
                            {cert.documents && cert.documents.length > 0 ? (
                                cert.documents.map((document, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                                <FileText size={14} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {document.nomOriginal}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {document.typeDocument} • {Math.round(document.tailleFichier / 1024)} KB
                                                    • {formatDate(document.dateUpload)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadDocument(document)}
                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                title="Télécharger"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Aucun document associé
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {cert.notes && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{cert.notes}</p>
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

export default CertificatDetailModal;