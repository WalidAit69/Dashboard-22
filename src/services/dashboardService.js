import API from '../utils/Api.js';

class DashboardService {
    static async getSummary() {
        try {
            const response = await API.get('/DashboardExportation/summary');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    }

    static async getTvnExpEca() {
        try {
            const response = await API.get('/DashboardExportation/tvn-exp-eca');
            return response.data;
        } catch (error) {
            console.error('Error fetching TVN EXP ECA data:', error);
            throw error;
        }
    }

    static async getExportationDestinations(codvar = null) {
        try {
            const params = codvar ? { codvar } : {};
            const response = await API.get('/DashboardExportation/exportation-destinations', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching exportation destinations:', error);
            throw error;
        }
    }

    static async getExportateursVarietes(codvar = null, nomExportateur = null) {
        try {
            const params = {};
            if (codvar) params.codvar = codvar;
            if (nomExportateur) params.nomExportateur = nomExportateur;
            
            const response = await API.get('/DashboardExportation/exportateurs-varietes', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching exportateurs varietes:', error);
            throw error;
        }
    }

    static async getTopVarietes(type = 'export', limit = 10) {
        try {
            const response = await API.get('/DashboardExportation/top-varietes', { 
                params: { type, limit } 
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching top varietes:', error);
            throw error;
        }
    }

    static async getVarieteDetails(codvar) {
        try {
            const response = await API.get(`/DashboardExportation/variete-details/${codvar}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching variete details:', error);
            throw error;
        }
    }

    static async getStatistiquesGlobales() {
        try {
            const response = await API.get('/DashboardExportation/statistiques-globales');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistiques globales:', error);
            throw error;
        }
    }
}

export default DashboardService;