import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Download, Plus, Trash2, ChevronLeft, ChevronRight, Search, AlertCircle, Pen, Filter, X } from 'lucide-react';
import API from '../../../utils/Api';
import Loader from '../../ui/Loader';
import ConfirmationModal from "../producteur/ConfirmationModal";
import { Link } from 'react-router-dom';

const DeclarationVergerTable = ({
    initialData = [],
    onRefresh,
    filters = {},
    onFilterChange,
    onClearFilters,
    filterOptions = { vergers: [], varietes: [], stations: [] },
    hasActiveFilters = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // State for data management
    const [declarations, setDeclarations] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // State for delete modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        declaration: null,
        loading: false
    });

    // Update declarations when initialData changes
    useEffect(() => {
        setDeclarations(initialData);
        setCurrentPage(1); // Reset to first page when data changes
    }, [initialData]);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to first page when search changes
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    // Get variety name from codvar
    const getVarietyName = (codvar) => {
        const variety = filterOptions.varietes.find(v => v.codvar === codvar);
        return variety ? variety.nomvar || `Variété ${codvar}` : `Variété ${codvar}`;
    };

    // Get verger name from refver
    const getVergerName = (refver) => {
        const verger = filterOptions.vergers.find(v => v.refver === refver);
        return verger ? verger.name || verger.libelle || `Verger ${refver}` : `Verger ${refver}`;
    };

    // Filter declarations based on search term only (filters are applied at parent level)
    const filteredDeclarations = useMemo(() => {
        if (!declarations.length) return [];

        return declarations.filter(declaration => {
            if (!debouncedSearchTerm) return true;

            const matchesSearch =
                declaration.id?.toString().includes(debouncedSearchTerm.toLowerCase()) ||
                declaration.refverReel?.toString().includes(debouncedSearchTerm.toLowerCase()) ||
                declaration.refverNreel?.toString().includes(debouncedSearchTerm.toLowerCase()) ||
                declaration.refstat?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                declaration.codvar?.toString().includes(debouncedSearchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [declarations, debouncedSearchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredDeclarations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDeclarations = filteredDeclarations.slice(startIndex, startIndex + itemsPerPage);

    const getAvatarColor = (id) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        return colors[id % colors.length];
    };

    // Get unique refverReel values from vergers
    const getUniqueRefverReel = () => {
        return [...new Set(filterOptions.vergers.map(v => v.refver).filter(ref => ref !== null && ref !== undefined))];
    };

    // Get unique refverNreel values from vergers  
    const getUniqueRefverNreel = () => {
        return [...new Set(filterOptions.vergers.map(v => v.refver).filter(ref => ref !== null && ref !== undefined))];
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
                    {/* Search and Actions */}
                    <div className="flex flex-col gap-4">
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
                                        placeholder="Rechercher par ID, référence, variété..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full sm:w-64"
                                    />
                                    {searchTerm !== debouncedSearchTerm && (
                                        <div className="absolute right-3 top-3">
                                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${hasActiveFilters
                                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filtres
                                        {hasActiveFilters && (
                                            <span className="bg-primary-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                                {Object.values(filters).filter(f => f !== '').length}
                                            </span>
                                        )}
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Exporter
                                    </button>
                                    <Link to={"/gestion/declaration-verger/add"} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Nouvelle Déclaration
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        {showFilters && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* REF VERGER RÉEL Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            REF VERGER RÉEL
                                        </label>
                                        <select
                                            value={filters.refverReel || ''}
                                            onChange={(e) => onFilterChange('refverReel', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Tous les vergers réels</option>
                                            {getUniqueRefverReel().map(refver => (
                                                <option key={refver} value={refver}>
                                                    {getVergerName(refver)} ({refver})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* REF VERGER N-RÉEL Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            REF VERGER N-RÉEL
                                        </label>
                                        <select
                                            value={filters.refverNreel || ''}
                                            onChange={(e) => onFilterChange('refverNreel', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Tous les vergers non-réels</option>
                                            {getUniqueRefverNreel().map(refver => (
                                                <option key={refver} value={refver}>
                                                    {getVergerName(refver)} ({refver})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* VARIÉTÉ Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            VARIÉTÉ
                                        </label>
                                        <select
                                            value={filters.codvar || ''}
                                            onChange={(e) => onFilterChange('codvar', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Toutes les variétés</option>
                                            {filterOptions.varietes.map(variete => (
                                                <option key={variete.codvar} value={variete.codvar}>
                                                    {variete.name || variete.libelle || `Variété ${variete.codvar}`} ({variete.codvar})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* STATION Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            STATION
                                        </label>
                                        <select
                                            value={filters.station || ''}
                                            onChange={(e) => onFilterChange('station', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Toutes les stations</option>
                                            {filterOptions.stations.map(station => (
                                                <option key={station} value={station}>
                                                    {station}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Filter Actions */}
                                {hasActiveFilters && (
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={onClearFilters}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Effacer tous les filtres
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATION</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedDeclarations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        {filteredDeclarations.length === 0 && declarations.length > 0
                                            ? "Aucun résultat trouvé pour votre recherche"
                                            : "Aucune déclaration trouvée"}
                                    </td>
                                </tr>
                            ) : (
                                paginatedDeclarations.map((declaration) => {
                                    const varietyName = getVarietyName(declaration.codvar);

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
                                                <div className="text-sm font-medium text-gray-900">
                                                    {declaration.refverReel || '-'}
                                                </div>
                                                {declaration.refverReel && (
                                                    <div className="text-xs text-gray-400">
                                                        {getVergerName(declaration.refverReel)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {declaration.refverNreel || '-'}
                                                </div>
                                                {declaration.refverNreel && (
                                                    <div className="text-xs text-gray-400">
                                                        {getVergerName(declaration.refverNreel)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{declaration.codvar}</div>
                                                <div className="text-xs text-gray-400">{varietyName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{declaration.refstat}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openDeleteModal(declaration)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <Link to={`/gestion/declaration-verger/edit/${declaration.id}`}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Pen className="w-4 h-4" />
                                                    </Link>
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
                            {debouncedSearchTerm && (
                                <span className="ml-2 text-gray-400">
                                    (recherche appliquée)
                                </span>
                            )}
                            {hasActiveFilters && (
                                <span className="ml-2 text-blue-600">
                                    (filtres actifs)
                                </span>
                            )}
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