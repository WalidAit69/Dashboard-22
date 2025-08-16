import { useState } from 'react';
import { Edit, Trash2, Eye, Upload, Calendar, FileText, History } from 'lucide-react';
import CertificatDetailModal from './CertificatDetailModal';
import UploadDocumentModal from './UploadDocumentModal';
import HistoriqueModal from './HistoriqueModal';

const CertificatTable = ({ certificats, onEdit, onDelete, getStatutBadge }) => {
    const [selectedCertificat, setSelectedCertificat] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);

    const handleViewDetails = (certificat) => {
        setSelectedCertificat(certificat);
        setShowDetailModal(true);
    };

    const handleUploadDocument = (certificat) => {
        setSelectedCertificat(certificat);
        setShowUploadModal(true);
    };

    const handleViewHistorique = (certificat) => {
        setSelectedCertificat(certificat);
        setShowHistoriqueModal(true);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    if (!certificats.length) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun certificat trouvé</h3>
                <p className="text-gray-500">Commencez par ajouter un nouveau certificat.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Certificat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Verger / Producteur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type / Organisme
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Taux
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {certificats.map((certificat) => (
                                <tr key={certificat.idCertificat} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {certificat.numeroCertificat || '-'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {certificat.idCertificat}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {certificat.nomVerger || '-'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {certificat.nomProducteur || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900">
                                                {certificat.nomTypeCertificat || '-'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {certificat.nomOrganisme || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col text-sm text-gray-900">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400" />
                                                <span>Exp: {formatDate(certificat.dateExpiration)}</span>
                                            </div>
                                            {certificat.dateObtention && (
                                                <div className="text-xs text-gray-500">
                                                    Obt: {formatDate(certificat.dateObtention)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatutBadge(certificat.statut, certificat.joursRestants)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {certificat.tauxReussite ? `${certificat.tauxReussite}%` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(certificat)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Voir les détails"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleUploadDocument(certificat)}
                                                className="text-green-600 hover:text-green-900"
                                                title="Ajouter un document"
                                            >
                                                <Upload size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleViewHistorique(certificat)}
                                                className="text-purple-600 hover:text-purple-900"
                                                title="Voir l'historique"
                                            >
                                                <History size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(certificat)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(certificat.idCertificat)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showDetailModal && selectedCertificat && (
                <CertificatDetailModal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    certificat={selectedCertificat}
                />
            )}

            {showUploadModal && selectedCertificat && (
                <UploadDocumentModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    certificatId={selectedCertificat.idCertificat}
                />
            )}

            {showHistoriqueModal && selectedCertificat && (
                <HistoriqueModal
                    isOpen={showHistoriqueModal}
                    onClose={() => setShowHistoriqueModal(false)}
                    certificatId={selectedCertificat.idCertificat}
                />
            )}
        </>
    );
};

export default CertificatTable;