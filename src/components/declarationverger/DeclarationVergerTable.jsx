import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Download, Plus, Trash2, Eye, ChevronLeft, ChevronRight, Search, AlertCircle, Pen } from 'lucide-react';
import API from '../../utils/Api';
import Loader from '../ui/Loader';
import ConfirmationModal from "../../components/producteur/ConfirmationModal";
import { Link } from 'react-router-dom';

const DeclarationVergerTable = ({ initialData = [], onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [campagneFilter, setCampagneFilter] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // State for data management
    const [declarations, setDeclarations] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // State for campagne options
    const [campagneOptions, setCampagneOptions] = useState([]);
    const [campagneOptionsLoading, setCampagneOptionsLoading] = useState(false);

    // State for delete modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        declaration: null,
        loading: false
    });

    // Update declarations when initialData changes
    useEffect(() => {
        setDeclarations(initialData);
    }, [initialData]);

    // Fetch campagne options
    const fetchCampagneOptions = async () => {
        try {
            setCampagneOptionsLoading(true);
            const res = await API.get("/Campagnes");

            if (res.data && Array.isArray(res.data)) {
                setCampagneOptions(res.data);
            } else {
                setCampagneOptions([]);
            }
        } catch (error) {
            console.error('Error fetching campagne options:', error);
            setCampagneOptions([]);
        } finally {
            setCampagneOptionsLoading(false);
        }
    };

    // Fetch campagne options on component mount
    useEffect(() => {
        fetchCampagneOptions();
    }, []);

    const GetData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError(null);

            const res = await API.get("/DeclarationVergers");

            if (res.data && Array.isArray(res.data)) {
                setDeclarations(res.data);
                if (onRefresh) {
                    onRefresh();
                }
            } else {
                setDeclarations(res.data ? [res.data] : []);
            }

            setRetryCount(0);
        } catch (error) {
            console.error('Error fetching declarations:', error);
            setError({
                message: error.response?.data?.message || error.message || 'Failed to fetch data',
                status: error.response?.status,
                canRetry: error.response?.status !== 404
            });
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Delete declaration function
    const handleDelete = async () => {
        setDeleteModal(prev => ({ ...prev, loading: true }));

        try {
            await API.delete(`/DeclarationVergers/${deleteModal.declaration.id}`);
            setDeclarations(prev => prev.filter(item => item.id !== deleteModal.declaration.id));
            setDeleteModal({ isOpen: false, declaration: null, loading: false });

            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting declaration:', error);
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    const openDeleteModal = (declaration) => {
        setDeleteModal({
            isOpen: true,
            declaration: declaration,
            loading: false
        });
    };

    const closeDeleteModal = () => {
        if (!deleteModal.loading) {
            setDeleteModal({
                isOpen: false,
                declaration: null,
                loading: false
            });
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        GetData();
    };

    useEffect(() => {
        if (!initialData.length) {
            GetData();
        }
    }, [initialData.length]);

    // Status mapping for display
    const getStatusFromRefstat = (refstat) => {
        // You can customize this mapping based on your business logic
        const statusMap = {
            '7816': 'En attente',
            '7817': 'Validé',
            '7818': 'Rejeté'
        };
        return statusMap[refstat] || 'En attente';
    };

    // Variety mapping for display
    const getVarietyFromCodvar = (codvar) => {
        // You can customize this mapping based on your business logic
        const varietyMap = {
            122: 'Pomme Golden',
            123: 'Pomme Red Delicious',
            124: 'Poire Williams'
        };
        return varietyMap[codvar] || `Variété ${codvar}`;
    };

    // Filter and search logic - updated for new data structure
    const filteredDeclarations = useMemo(() => {
        if (!declarations.length) return [];

        return declarations.filter(declaration => {
            const status = getStatusFromRefstat(declaration.refstat);
            const variety = getVarietyFromCodvar(declaration.codvar);

            const matchesSearch =
                declaration.id?.toString().includes(searchTerm.toLowerCase()) ||
                declaration.refverReel?.toString().includes(searchTerm.toLowerCase()) ||
                declaration.refverNreel?.toString().includes(searchTerm.toLowerCase()) ||
                declaration.refstat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                variety.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = !statusFilter || status === statusFilter;
            const matchesCampagne = !campagneFilter || declaration.campagne === campagneFilter;

            return matchesSearch && matchesStatus && matchesCampagne;
        });
    }, [declarations, searchTerm, statusFilter, campagneFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredDeclarations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDeclarations = filteredDeclarations.slice(startIndex, startIndex + itemsPerPage);

    const statusOptions = ['En attente', 'Validé', 'Rejeté'];

    const getAvatarColor = (id) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        return colors[id % colors.length];
    };

    if (loading && !declarations.length) {
        return <Loader />;
    }

    if (error && !declarations.length) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-500 mb-4">{error.message}</p>
                    {error.status && (
                        <p className="text-sm text-gray-400 mb-4">Code d'erreur: {error.status}</p>
                    )}
                    {error.canRetry && (
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            disabled={retryCount >= 3}
                        >
                            {retryCount >= 3 ? 'Trop de tentatives' : 'Réessayer'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                            >
                                <option value="">Tous les statuts</option>
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Campagne Filter */}
                        <div className="relative">
                            <select
                                value={campagneFilter}
                                onChange={(e) => setCampagneFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                disabled={campagneOptionsLoading}
                            >
                                <option value="">Toutes les campagnes</option>
                                {campagneOptions.map(campagne => (
                                    <option key={campagne.id} value={campagne.nom}>
                                        {campagne.nom}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                            {campagneOptionsLoading && (
                                <div className="absolute right-8 top-3">
                                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search and Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none pr-10"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par ID, référence..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Exporter
                                </button>
                                <Link to={"/declaration-verger/add"} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Nouvelle Déclaration
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REF VERGER RÉEL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REF VERGER N-RÉEL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VARIÉTÉ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedDeclarations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        {filteredDeclarations.length === 0 && declarations.length > 0
                                            ? "Aucun résultat trouvé pour votre recherche"
                                            : "Aucune déclaration trouvée"}
                                    </td>
                                </tr>
                            ) : (
                                paginatedDeclarations.map((declaration) => {
                                    const variety = getVarietyFromCodvar(declaration.codvar);

                                    return (
                                        <tr key={declaration.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(declaration.id)} flex items-center justify-center text-white text-sm font-medium mr-3`}>
                                                        {declaration.id.toString().slice(-2)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">#{declaration.id}</div>
                                                        <div className="text-xs text-gray-400">
                                                            {declaration.refstat}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{declaration.refverReel}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{declaration.refverNreel}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{variety}</div>
                                                <div className="text-sm text-gray-500">Code: {declaration.codvar}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        className="text-gray-400 hover:text-primary-600 transition-colors"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(declaration)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Pen className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredDeclarations.length)} sur {filteredDeclarations.length} entrées
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium ${currentPage === pageNum
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer la déclaration #{itemName} ? Cette action est irréversible."
                itemName={deleteModal.declaration?.id}
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={deleteModal.loading}
                loadingText="Suppression..."
                type="danger"
            />
        </>
    );
};

export default DeclarationVergerTable;