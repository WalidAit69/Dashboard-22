import API from './Api';

const API_BASE_URL = '/certificat';

export class CertificatService {
    
    // Récupérer tous les certificats avec filtres optionnels
    static async getCertificats(filters = {}) {
        try {
            const params = new URLSearchParams();
            
            if (filters.refver) params.append('refver', filters.refver);
            if (filters.statut) params.append('statut', filters.statut);
            if (filters.typeId) params.append('typeId', filters.typeId);
            if (filters.includeInactifs) params.append('includeInactifs', filters.includeInactifs);
            
            const queryString = params.toString();
            
            const response = await API.get(queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des certificats:', error);
            throw error;
        }
    }

    // Récupérer un certificat spécifique
    static async getCertificat(id) {
        try {
            const response = await API.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du certificat:', error);
            throw error;
        }
    }

    // Créer un nouveau certificat
    static async createCertificat(certificatData) {
        try {
            const response = await API.post(API_BASE_URL, certificatData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création du certificat:', error);
            throw error;
        }
    }

    // Mettre à jour un certificat
    static async updateCertificat(id, certificatData) {
        try {
            const dataToSend = {
                ...certificatData,
                idCertificat: id
            };
            const response = await API.put(`${API_BASE_URL}/${id}`, dataToSend);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du certificat:', error);
            throw error;
        }
    }

    // Supprimer un certificat (soft delete)
    static async deleteCertificat(id) {
        try {
            const response = await API.delete(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression du certificat:', error);
            throw error;
        }
    }

    // Télécharger un document pour un certificat
    static async uploadDocument(certificatId, formData) {
        try {
            const response = await API.post(`${API_BASE_URL}/${certificatId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'upload du document:', error);
            throw error;
        }
    }

    // Récupérer les statistiques des certificats
    static async getStatistiques() {
        try {
            const response = await API.get(`${API_BASE_URL}/statistiques`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }

    // Récupérer les notifications d'expiration
    static async getNotificationsExpiration() {
        try {
            const response = await API.get(`${API_BASE_URL}/notifications-expiration`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            throw error;
        }
    }

    // Récupérer l'historique d'un certificat
    static async getHistorique(certificatId) {
        try {
            const response = await API.get(`${API_BASE_URL}/${certificatId}/historique`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            throw error;
        }
    }

    // Méthodes utilitaires

    // Formater une date pour l'affichage
    static formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    }

    // Calculer les jours restants avant expiration
    static calculateRemainingDays(expirationDate) {
        if (!expirationDate) return null;
        const now = new Date();
        const expDate = new Date(expirationDate);
        const diffTime = expDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Déterminer le statut basé sur la date d'expiration
    static getStatusFromDate(expirationDate) {
        const remainingDays = this.calculateRemainingDays(expirationDate);
        if (remainingDays === null) return 'Inconnu';
        
        if (remainingDays < 0) return 'Expire';
        if (remainingDays <= 90) return 'Expirant'; // 3 mois
        return 'Valide';
    }

    // Obtenir la couleur du badge de statut
    static getStatusBadgeClass(statut) {
        switch (statut) {
            case 'Valide':
                return 'bg-green-100 text-green-800';
            case 'Expirant':
                return 'bg-orange-100 text-orange-800';
            case 'Expire':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    // Valider les données d'un certificat
    static validateCertificatData(data) {
        const errors = {};

        if (!data.refver) errors.refver = 'Le verger est requis';
        if (!data.idTypeCertificat) errors.idTypeCertificat = 'Le type de certificat est requis';
        if (!data.idOrganisme) errors.idOrganisme = 'L\'organisme est requis';
        if (!data.numeroCertificat) errors.numeroCertificat = 'Le numéro de certificat est requis';
        if (!data.dateExpiration) errors.dateExpiration = 'La date d\'expiration est requise';
        
        if (data.tauxReussite !== null && data.tauxReussite !== undefined) {
            if (data.tauxReussite < 0 || data.tauxReussite > 100) {
                errors.tauxReussite = 'Le taux doit être entre 0 et 100';
            }
        }

        // Validation des dates
        if (data.dateExpiration && data.dateObtention) {
            const dateExp = new Date(data.dateExpiration);
            const dateObt = new Date(data.dateObtention);
            if (dateExp <= dateObt) {
                errors.dateExpiration = 'La date d\'expiration doit être postérieure à la date d\'obtention';
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Exporter les certificats (placeholder)
    static async exportCertificats(format = 'csv', filters = {}) {
        try {
            // Cette méthode pourrait être implémentée côté serveur
            console.log(`Export des certificats en format ${format} avec filtres:`, filters);
            
            // Pour l'instant, on récupère les données et on les traite côté client
            const certificats = await this.getCertificats(filters);
            
            if (format === 'csv') {
                return this.convertToCSV(certificats);
            }
            
            return certificats;
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            throw error;
        }
    }

    // Convertir les données en CSV
    static convertToCSV(certificats) {
        if (!certificats || certificats.length === 0) return '';
        
        const headers = [
            'ID',
            'Numéro',
            'Verger',
            'Producteur',
            'Type',
            'Organisme',
            'Date Obtention',
            'Date Expiration',
            'Taux Réussite',
            'Statut',
            'Notes'
        ];
        
        const csvContent = [
            headers.join(','),
            ...certificats.map(cert => [
                cert.idCertificat,
                `"${cert.numeroCertificat || ''}"`,
                `"${cert.nomVerger || ''}"`,
                `"${cert.nomProducteur || ''}"`,
                `"${cert.nomTypeCertificat || ''}"`,
                `"${cert.nomOrganisme || ''}"`,
                this.formatDate(cert.dateObtention),
                this.formatDate(cert.dateExpiration),
                cert.tauxReussite || '',
                cert.statut || '',
                `"${cert.notes || ''}"`
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }
}