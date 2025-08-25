import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import DashboardService from '../../services/dashboardService';

const TopDestinationsChart = () => {
    const [topDestinations, setTopDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopDestinations = async () => {
            try {
                setLoading(true);
                const stats = await DashboardService.getStatistiquesGlobales();
                setTopDestinations(stats.topDestinations || []);
            } catch (error) {
                console.error('Error fetching top destinations:', error);
                setTopDestinations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopDestinations();
    }, []);

    const formatNumber = (number) => {
        if (number == null) return '0';
        return Number(number).toLocaleString('fr-FR');
    };

    const getMaxValue = () => {
        return Math.max(...topDestinations.map(d => d.poidsTotal || 0));
    };

    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-red-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-gray-500'
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="h-3 bg-gray-200 rounded flex-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-16"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-6">
                <Globe className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Top Destinations</h3>
            </div>

            <div className="space-y-4">
                {topDestinations.length > 0 ? (
                    topDestinations.map((destination, index) => {
                        const percentage = ((destination.poidsTotal || 0) / getMaxValue()) * 100;
                        return (
                            <div key={destination.pays} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {destination.pays}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">
                                            {formatNumber(destination.poidsTotal)} kg
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {destination.nombreVarietes} variété{destination.nombreVarietes > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${colors[index % colors.length]} transition-all duration-300`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Aucune destination trouvée</p>
                    </div>
                )}
            </div>

            {topDestinations.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                    <div className="text-xs text-gray-500">
                        Total exporté: {formatNumber(topDestinations.reduce((sum, d) => sum + (d.poidsTotal || 0), 0))} kg
                        vers {topDestinations.length} destination{topDestinations.length > 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopDestinationsChart;