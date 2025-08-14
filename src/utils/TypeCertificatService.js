import API from './Api';

const TypeCertificatService = {
    // Récupérer tous les types de certificat actifs (pour les selects)
    getTypesCertificatActifs: async () => {
        try {
            const response = await API.get('/TypeCertificat/actifs');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des types de certificat actifs:', error);
            throw error;
        }
    },

    // Récupérer tous les types de certificat
    getAllTypesCertificat: async (includeInactifs = false) => {
        try {
            const response = await API.get('/TypeCertificat', {
                params: { includeInactifs }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des types de certificat:', error);
            throw error;
        }
    },

    // Récupérer un type de certificat par ID
    getTypeCertificatById: async (id) => {
        try {
            const response = await API.get(`/TypeCertificat/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du type de certificat:', error);
            throw error;
        }
    }
};

export default TypeCertificatService;