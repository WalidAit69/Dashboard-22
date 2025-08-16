import { useState, useEffect } from 'react';
import { Building, Plus, Edit2, Trash2, Eye, BarChart3, Search, Calendar, Mail, Phone, Globe, AlertCircle } from 'lucide-react';
import OrganismeModal from '../../../../components/Gestion/certificat/OrganismeModal';
import ConfirmationModal from '../../../../components/Gestion/producteur/ConfirmationModal';
import OrganismeService from '../../../../utils/OrganismeService';

function OrganismePage() {
    const [organismes, setOrganismes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [selectedOrganisme, setSelectedOrganisme] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [showStatistiques, setShowStatistiques] = useState(false);
    const [statistiques, setStatistiques] = useState(null);
    const [certificatsOrganisme, setCertificatsOrganisme] = useState([]);
    const [viewingCertificats, setViewingCertificats] = useState(null);

    useEffect(() => {
        loadOrganismes();
    }, []);

    const loadOrganismes = async () => {
        try {
            setLoading(true);
            const data = await OrganismeService.getAllOrganismes(true); // Charger tous les organismes (actifs et inactifs)
            setOrganismes(data);
        } catch (error) {
            console.error('Erreur lors du chargement des organismes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistiques = async () => {
        try {
            const stats = await OrganismeService.getStatistiques();
            setStatistiques(stats);
            setShowStatistiques(true);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    };

    const loadCertificatsOrganisme = async (organismeId) => {
        try {
            const certificats = await OrganismeService.getCertificatsOrganisme(organismeId);
            setCertificatsOrganisme(certificats);
            setViewingCertificats(organismeId);
        } catch (error) {
            console.error('Erreur lors du chargement des certificats:', error);
        }
    };

    const handleSaveOrganisme = async (organismeData) => {
        try {
            if (selectedOrganisme) {
                // Handle status update separately if it has changed
                if (selectedOrganisme.actif !== organismeData.actif) {
                    await OrganismeService.updateStatutOrganisme(selectedOrganisme.idOrganisme, organismeData.actif);
                }
                // Update other organism data (excluding status)
                const { actif, ...otherData } = organismeData;
                await OrganismeService.updateOrganisme(selectedOrganisme.idOrganisme, otherData);
            } else {
                await OrganismeService.createOrganisme(organismeData);
            }
            await loadOrganismes();
            setModalOpen(false);
            setSelectedOrganisme(null);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleDeleteOrganisme = async () => {
        if (!selectedOrganisme) return;

        try {
            await OrganismeService.deleteOrganisme(selectedOrganisme.idOrganisme);
            await loadOrganismes();
            setConfirmModalOpen(false);
            setSelectedOrganisme(null);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const filteredOrganismes = organismes.filter(organisme => {
        // Filtre par terme de recherche
        const matchesSearch = organisme.nomOrganisme.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (organisme.email && organisme.email.toLowerCase().includes(searchTerm.toLowerCase()));

        // Filtre par statut
        let matchesStatus = true;
        if (statusFilter === 'active') {
            matchesStatus = !!organisme.actif;
        } else if (statusFilter === 'inactive') {
            matchesStatus = !organisme.actif;
        }

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des organismes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Organismes de Certification</h1>
                        <p className="text-sm text-gray-500">Gérer les organismes de certification</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadStatistiques}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <BarChart3 size={16} />
                        Statistiques
                    </button>
                    <button
                        onClick={() => {
                            setSelectedOrganisme(null);
                            setModalOpen(true);
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Nouvel Organisme
                    </button>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="all">Tous les organismes</option>
                            <option value="active">Organismes actifs</option>
                            <option value="inactive">Organismes inactifs</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            {showStatistiques && statistiques && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-blue-900">Statistiques des Organismes</h3>
                        <button
                            onClick={() => setShowStatistiques(false)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            ×
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistiques.totalOrganismes}</div>
                            <div className="text-sm text-blue-700">Total Organismes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">{statistiques.organismesActifs}</div>
                            <div className="text-sm text-primary-700">Organismes Actifs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistiques.organismesAvecCertificats}</div>
                            <div className="text-sm text-purple-700">Avec Certificats</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{statistiques.nombreTotalCertificats}</div>
                            <div className="text-sm text-orange-700">Total Certificats</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificats d'un organisme */}
            {viewingCertificats && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">
                            Certificats de {organismes.find(o => o.idOrganisme === viewingCertificats)?.nomOrganisme}
                        </h3>
                        <button
                            onClick={() => setViewingCertificats(null)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ×
                        </button>
                    </div>
                    {certificatsOrganisme.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left p-2">Numéro</th>
                                        <th className="text-left p-2">Verger</th>
                                        <th className="text-left p-2">Type</th>
                                        <th className="text-left p-2">Expiration</th>
                                        <th className="text-left p-2">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {certificatsOrganisme.map(cert => (
                                        <tr key={cert.idCertificat} className="border-b">
                                            <td className="p-2">{cert.numeroCertificat}</td>
                                            <td className="p-2">{cert.nomVerger || '-'}</td>
                                            <td className="p-2">{cert.typeCertificat || '-'}</td>
                                            <td className="p-2">{formatDate(cert.dateExpiration)}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${cert.joursRestants > 90
                                                        ? 'bg-primary-100 text-primary-800'
                                                        : cert.joursRestants > 30
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {cert.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Aucun certificat trouvé</p>
                    )}
                </div>
            )}

            {/* Tableau des organismes */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Organisme</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Informations</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Date de création</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrganismes.length > 0 ? (
                                filteredOrganismes.map((organisme) => (
                                    <tr key={organisme.idOrganisme} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <Building className="w-4 h-4 text-primary-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">
                                                            {organisme.nomOrganisme}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${organisme.actif
                                                                ? 'bg-primary-100 text-primary-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {organisme.actif ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </div>
                                                    {organisme.adresse && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {organisme.adresse}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="space-y-1">
                                                {organisme.email && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Mail className="w-3 h-3" />
                                                        <span className="truncate max-w-xs">{organisme.email}</span>
                                                    </div>
                                                )}
                                                {organisme.telephone && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{organisme.telephone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {organisme.siteWeb ? (
                                                <a
                                                    href={organisme.siteWeb}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    <span className="truncate max-w-xs">Site Web</span>
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(organisme.dateCreation)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => loadCertificatsOrganisme(organisme.idOrganisme)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Voir les certificats"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrganisme(organisme);
                                                        setModalOpen(true);
                                                    }}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrganisme(organisme);
                                                        setConfirmModalOpen(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={48} className="text-gray-300" />
                                            <p>Aucun organisme trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <OrganismeModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedOrganisme(null);
                }}
                onSave={handleSaveOrganisme}
                organisme={selectedOrganisme}
            />

            <ConfirmationModal
                isOpen={confirmModalOpen}
                onClose={() => {
                    setConfirmModalOpen(false);
                    setSelectedOrganisme(null);
                }}
                onConfirm={handleDeleteOrganisme}
                title="Supprimer l'organisme"
                message={`Êtes-vous sûr de vouloir supprimer l'organisme "${selectedOrganisme?.nomOrganisme}" ? Cette action désactivera l'organisme mais conservera ses données.`}
                type="danger"
            />
        </div>
    );
}

export default OrganismePage;