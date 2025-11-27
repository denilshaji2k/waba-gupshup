const axios = require('axios');

class GupshupService {
  constructor(apiKey, appId) {
    this.apiKey = apiKey;
    this.appId = appId;
    this.baseURL = process.env.GUPSHUP_BASE_URL || 'https://api.gupshup.io/wa';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }

  // Send text message
  async sendMessage(phoneNumber, message, messageType = 'text') {
    try {
      const response = await this.client.post('/messages/send', {
        to: phoneNumber,
        type: messageType,
        payload: {
          body: message,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send template message
  async sendTemplateMessage(phoneNumber, templateName, variables = [], language = 'en') {
    try {
      const response = await this.client.post('/messages/send', {
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language,
          },
          body: {
            placeholders: variables,
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending template message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create template
  async createTemplate(templateData) {
    try {
      const payload = {
        name: templateData.name,
        category: templateData.category,
        languageCode: templateData.language || 'en',
        structure: {
          header: templateData.header,
          body: templateData.body,
          footer: templateData.footer,
          buttons: templateData.buttons,
        },
      };

      if (templateData.variables && templateData.variables.length > 0) {
        payload.structure.body = this._insertVariablePlaceholders(
          templateData.body,
          templateData.variables
        );
      }

      const response = await this.client.post('/templates', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get templates
  async getTemplates() {
    try {
      const response = await this.client.get('/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error.response?.data || error.message);
      throw error;
    }
  }

  // Delete template
  async deleteTemplate(templateId) {
    try {
      const response = await this.client.delete(`/templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get message status
  async getMessageStatus(messageId) {
    try {
      const response = await this.client.get(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching message status:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update business profile
  async updateBusinessProfile(profileData) {
    try {
      const response = await this.client.put('/profile', {
        about: profileData.about,
        address: profileData.address,
        email: profileData.email,
        websites: profileData.websites,
        vertical: profileData.vertical,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get app info
  async getAppInfo() {
    try {
      const response = await this.client.get(`/apps/${this.appId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching app info:', error.response?.data || error.message);
      throw error;
    }
  }

  // Upload media
  async uploadMedia(file, mediaType) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', mediaType);

      const response = await axios.post(`${this.baseURL}/media/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error.response?.data || error.message);
      throw error;
    }
  }

  // Send media message
  async sendMediaMessage(phoneNumber, mediaUrl, mediaType, caption = '') {
    try {
      const payload = {
        to: phoneNumber,
        type: mediaType,
        payload: {
          url: mediaUrl,
        },
      };

      if (caption && ['image', 'video', 'document'].includes(mediaType)) {
        payload.payload.caption = caption;
      }

      const response = await this.client.post('/messages/send', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending media message:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get conversation
  async getConversation(phoneNumber) {
    try {
      const response = await this.client.get('/conversations', {
        params: {
          contact: phoneNumber,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error.response?.data || error.message);
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      const response = await this.client.put(`/messages/${messageId}`, {
        status: 'read',
      });
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error.response?.data || error.message);
      throw error;
    }
  }

  // Helper method to insert variable placeholders
  _insertVariablePlaceholders(text, variables) {
    let result = text;
    variables.forEach((variable, index) => {
      result = result.replace(`{{${index + 1}}}`, `{{${variable.placeholder}}}`);
    });
    return result;
  }
}

module.exports = GupshupService;
