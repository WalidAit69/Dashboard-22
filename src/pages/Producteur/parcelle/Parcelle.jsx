import { useState, useEffect, useMemo } from 'react';
import AnalyticsCard from '../../../components/dashboard/AnalyticsCard'
import ParcelleTable from '../../../components/parcelle/ParcelleTable'
import { MapPin, Trees, Droplets } from 'lucide-react';
import API from "../../../utils/Api";
import Loader from '../../../components/ui/Loader';

function Parcelle() {
    const [parcelles, setParcelles] = useState([]);
    const [vergers, setVergers] = useState([]);
    const [cultures, setCultures] = useState([]);
    const [sousVarietes, setSousVarietes] = useState([]);
    const [varietes, setVarietes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtersLoading, setFiltersLoading] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        codsvar: '',
        codvar: '',
        refver: '',
        codcul: ''
    });

    // Fetch parcelles data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await API.get("/Parcelles");

            if (res.data && Array.isArray(res.data)) {
                setParcelles(res.data);
            } else {
                const data = res.data ? [res.data] : [];
                setParcelles(data);
            }
        } catch (error) {
            console.error('Error fetching parcelles:', error);
            setError({
                message: error.response?.data?.message || error.message || 'Failed to fetch data',
                status: error.response?.status
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch filter data
    const fetchFilterData = async () => {
        try {
            setFiltersLoading(true);

            const [vergersRes, culturesRes, sousVarietesRes, varietesRes] = await Promise.all([
                API.get("/Vergers"),
                API.get("/Cultures"),
                API.get("/SousVarietes"),
                API.get("/Varietes")
            ]);

            setVergers(Array.isArray(vergersRes.data) ? vergersRes.data : []);
            setCultures(Array.isArray(culturesRes.data) ? culturesRes.data : []);
            setSousVarietes(Array.isArray(sousVarietesRes.data) ? sousVarietesRes.data : []);
            setVarietes(Array.isArray(varietesRes.data) ? varietesRes.data : []);
        } catch (error) {
            console.error('Error fetching filter data:', error);
        } finally {
            setFiltersLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchFilterData();
    }, []);

    // Apply advanced filters (Filtres spécialisés) - memoized for performance
    const filteredParcelles = useMemo(() => {
        let filtered = parcelles;

        if (filters.codsvar) {
            filtered = filtered.filter(p => p.codsvar != null && p.codsvar.toString() === filters.codsvar.toString());
        }
        if (filters.codvar) {
            filtered = filtered.filter(p => p.codvar != null && p.codvar.toString() === filters.codvar.toString());
        }
        if (filters.refver) {
            filtered = filtered.filter(p => p.refver != null && p.refver.toString() === filters.refver.toString());
        }
        if (filters.codcul) {
            filtered = filtered.filter(p => p.numcul != null && p.numcul.toString() === filters.codcul.toString());
        }

        return filtered;
    }, [parcelles, filters]);

    // Handle filter changes
    const handleFilterChange = (filterKey, value) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
            codsvar: '',
            codvar: '',
            refver: '',
            codcul: ''
        });
    };

    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    // Calculate analytics based on filtered parcelles data
    const calculateAnalytics = () => {
        if (!filteredParcelles.length) {
            return {
                totalParcelles: 0,
                totalSuperficie: 0,
                totalArbres: 0,
                parcellesIrriguees: 0
            };
        }

        const totalParcelles = filteredParcelles.length;
        const totalSuperficie = filteredParcelles.reduce((sum, p) => sum + (parseFloat(p.suppar) || 0), 0);
        const totalArbres = filteredParcelles.reduce((sum, p) => sum + (parseInt(p.nbrarb) || 0), 0);
        const parcellesIrriguees = filteredParcelles.filter(p => p.irriga && p.irriga.trim() !== '').length;

        return {
            totalParcelles,
            totalSuperficie,
            totalArbres,
            parcellesIrriguees
        };
    };

    const analytics = calculateAnalytics();

    // Mock percentage changes (in a real app, compare with previous period)
    const getChangePercentage = (current, type) => {
        const mockPrevious = {
            totalParcelles: Math.max(1, Math.floor(current * 0.9)),
            totalSuperficie: Math.max(1, Math.floor(current * 0.85)),
            totalArbres: Math.max(1, Math.floor(current * 0.88)),
            parcellesIrriguees: Math.max(1, Math.floor(current * 0.92))
        };

        const previous = mockPrevious[type] || 1;
        const change = ((current - previous) / previous) * 100;
        return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
    };

    const cards = [
        {
            title: "Total Parcelles",
            value: analytics.totalParcelles.toLocaleString(),
            change: getChangePercentage(analytics.totalParcelles, 'totalParcelles'),
            subtitle: "Nombre total de parcelles",
            icon: MapPin,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            changeColor: analytics.totalParcelles > 0 ? "text-green-600" : "text-gray-500"
        },
        {
            title: "Superficie Totale",
            value: `${analytics.totalSuperficie.toLocaleString()} ha`,
            change: getChangePercentage(analytics.totalSuperficie, 'totalSuperficie'),
            subtitle: "Surface cultivée totale",
            icon: MapPin,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            changeColor: analytics.totalSuperficie > 0 ? "text-green-600" : "text-gray-500"
        },
        {
            title: "Total Arbres",
            value: analytics.totalArbres.toLocaleString(),
            change: getChangePercentage(analytics.totalArbres, 'totalArbres'),
            subtitle: "Nombre total d'arbres",
            icon: Trees,
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            changeColor: analytics.totalArbres > 0 ? "text-green-600" : "text-gray-500"
        },
        {
            title: "Parcelles Irriguées",
            value: analytics.parcellesIrriguees.toLocaleString(),
            change: getChangePercentage(analytics.parcellesIrriguees, 'parcellesIrriguees'),
            subtitle: "Avec système d'irrigation",
            icon: Droplets,
            iconBg: "bg-cyan-100",
            iconColor: "text-cyan-600",
            changeColor: analytics.parcellesIrriguees > 0 ? "text-green-600" : "text-gray-500"
        }
    ];

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-500 mb-4">{error.message}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="flex flex-col gap-4 sm:gap-0">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:p-6">
                    {cards.map((card, index) => (
                        <AnalyticsCard card={card} key={index} />
                    ))}
                </div>

                {/* Results Summary */}
                <div className="sm:px-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <p className="text-sm text-gray-600">
                            Affichage de <span className="font-semibold text-gray-900">{filteredParcelles.length}</span> parcelles
                            {hasActiveFilters && (
                                <span> sur <span className="font-semibold text-gray-900">{parcelles.length}</span> au total</span>
                            )}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="ml-3 text-sm text-red-600 hover:text-red-800 underline"
                                >
                                    Effacer les filtres
                                </button>
                            )}
                        </p>
                    </div>
                </div>

                {/* Parcelle Table with integrated filters */}
                <div className='sm:px-6'>
                    <ParcelleTable
                        initialData={filteredParcelles}
                        onRefresh={fetchData}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        filterOptions={{
                            vergers,
                            cultures,
                            sousVarietes,
                            varietes
                        }}
                        filtersLoading={filtersLoading}
                    />
                </div>
            </div>
        </div>
    )
}

export default Parcelle