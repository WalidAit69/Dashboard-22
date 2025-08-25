import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import DashboardService from '../../services/dashboardService';

const TopExportateurChart = () => {
    const [topExportateurs, setTopExportateurs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopExportateurs = async () => {
            try {
                setLoading(true);
                const stats = await DashboardService.getStatistiquesGlobales();
                setTopExportateurs(stats.topExportateurs || []);
            } catch (error) {
                console.error('Error fetching top exportateurs:', error);
                setTopExportateurs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopExportateurs();
    }, []);

    const formatNumber = (number) => {
        if (number == null) return '0';
        return Number(number).toLocaleString('fr-FR');
    };

    const getMaxValue = () => {
        return Math.max(...topExportateurs.map(e => e.poidsTotal || 0));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
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
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Top Exportateurs</h3>
            </div>

            <div className="space-y-4">
                {topExportateurs.length > 0 ? (
                    topExportateurs.map((exportateur, index) => {
                        const percentage = ((exportateur.poidsTotal || 0) / getMaxValue()) * 100;
                        const cat1Percentage = exportateur.poidsTotal > 0 ? 
                            ((exportateur.totalCategorie1 || 0) / exportateur.poidsTotal) * 100 : 0;
                        
                        return (
                            <div key={exportateur.exportateur} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-700 truncate">
                                            {exportateur.exportateur}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {exportateur.nombreVarietes} variété{exportateur.nombreVarietes > 1 ? 's' : ''}
                                            {cat1Percentage > 0 && (
                                                <span className="ml-2">
                                                    • {cat1Percentage.toFixed(0)}% Cat1
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">
                                            {formatNumber(exportateur.poidsTotal)} kg
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            #{index + 1}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Aucun exportateur trouvé</p>
                    </div>
                )}
            </div>

            {topExportateurs.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                            <span className="font-medium">Total exporté:</span>
                            <div>{formatNumber(topExportateurs.reduce((sum, e) => sum + (e.poidsTotal || 0), 0))} kg</div>
                        </div>
                        <div>
                            <span className="font-medium">Cat1 global:</span>
                            <div>{formatNumber(topExportateurs.reduce((sum, e) => sum + (e.totalCategorie1 || 0), 0))} kg</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopExportateurChart;