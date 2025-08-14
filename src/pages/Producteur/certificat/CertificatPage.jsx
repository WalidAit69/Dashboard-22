import { useState, useEffect } from 'react';
import { Plus, Search, Download, FileText, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import CertificatModal from '../../../components/certificat/CertificatModal';
import CertificatTable from '../../../components/certificat/CertificatTable';
import StatistiquesCertificats from '../../../components/certificat/StatistiquesCertificats';
import { CertificatService } from '../../../utils/CertificatService';

const CertificatPage = () => {
    const [certificats, setCertificats] = useState([]);
    const [filteredCertificats, setFilteredCertificats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statutFilter, setStatutFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCertificat, setSelectedCertificat] = useState(null);
    const [showStatistiques, setShowStatistiques] = useState(false);

    useEffect(() => {
        loadCertificats();
    }, []);

    useEffect(() => {
        filterCertificats();
    }, [certificats, searchTerm, statutFilter]);

    const loadCertificats = async () => {
        try {
            setLoading(true);
            const data = await CertificatService.getCertificats();
            setCertificats(data);
        } catch (err) {
            setError('Erreur lors du chargement des certificats');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterCertificats = () => {
        let filtered = [...certificats];

        if (searchTerm) {
            filtered = filtered.filter(cert =>
                cert.numeroCertificat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.nomVerger?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.nomProducteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.nomTypeCertificat?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statutFilter) {
            filtered = filtered.filter(cert => cert.statut === statutFilter);
        }

        setFilteredCertificats(filtered);
    };

    const handleAdd = () => {
        setSelectedCertificat(null);
        setShowModal(true);
    };

    const handleEdit = (certificat) => {
        setSelectedCertificat(certificat);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce certificat ?')) {
            try {
                await CertificatService.deleteCertificat(id);
                await loadCertificats();
            } catch (err) {
                setError('Erreur lors de la suppression');
                console.error(err);
            }
        }
    };

    const handleSave = async (certificatData) => {
        try {
            if (selectedCertificat) {
                await CertificatService.updateCertificat(selectedCertificat.idCertificat, certificatData);
            } else {
                await CertificatService.createCertificat(certificatData);
            }
            setShowModal(false);
            await loadCertificats();
        } catch (err) {
            setError('Erreur lors de la sauvegarde');
            console.error(err);
        }
    };

    const getStatutBadge = (statut, joursRestants) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1";
        
        switch (statut) {
            case 'Valide':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800`}>
                        <CheckCircle size={12} />
                        Valide
                    </span>
                );
            case 'Expirant':
                return (
                    <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
                        <AlertTriangle size={12} />
                        Expire dans {joursRestants}j
                    </span>
                );
            case 'Expire':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800`}>
                        <XCircle size={12} />
                        Expiré
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                        {statut}
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Certificats</h1>
                    <p className="text-gray-600">Gérez les certificats des vergers</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowStatistiques(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <FileText size={16} />
                        Statistiques
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Nouveau Certificat
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher par numéro, verger, producteur..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={statutFilter}
                            onChange={(e) => setStatutFilter(e.target.value)}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="Valide">Valide</option>
                            <option value="Expirant">Expirant</option>
                            <option value="Expire">Expiré</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Résumé rapide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{certificats.length}</p>
                        </div>
                        <FileText className="text-blue-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Valides</p>
                            <p className="text-2xl font-bold text-green-600">
                                {certificats.filter(c => c.statut === 'Valide').length}
                            </p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Expirants</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {certificats.filter(c => c.statut === 'Expirant').length}
                            </p>
                        </div>
                        <AlertTriangle className="text-orange-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Expirés</p>
                            <p className="text-2xl font-bold text-red-600">
                                {certificats.filter(c => c.statut === 'Expire').length}
                            </p>
                        </div>
                        <XCircle className="text-red-500" size={24} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <CertificatTable
                certificats={filteredCertificats}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getStatutBadge={getStatutBadge}
            />

            {/* Modal */}
            {showModal && (
                <CertificatModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    certificat={selectedCertificat}
                />
            )}

            {/* Statistiques Modal */}
            {showStatistiques && (
                <StatistiquesCertificats
                    isOpen={showStatistiques}
                    onClose={() => setShowStatistiques(false)}
                />
            )}
        </div>
    );
};

export default CertificatPage;