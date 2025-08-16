import API from './Api';

const VergerService = {
    // Récupérer tous les vergers actifs (pour les selects)
    getVergersActifs: async () => {
        try {
            const response = await API.get('/Verger/actifs');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des vergers actifs:', error);
            throw error;
        }
    },

    // Récupérer tous les vergers
    getAllVergers: async (includeInactifs = false) => {
        try {
            const response = await API.get('/Vergers');
            console.log('Réponse de la récupération des vergers:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des vergers:', error);
            throw error;
        }
    },

    // Récupérer un verger par référence
    getVergerByRef: async (refver) => {
        try {
            const response = await API.get(`/Verger/${refver}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du verger:', error);
            throw error;
        }
    }
};

export default VergerService;