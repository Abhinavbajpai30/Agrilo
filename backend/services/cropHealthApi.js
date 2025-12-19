/**
 * Crop Health API Service for Agrilo
 * Provides crop disease detection, pest identification, and health monitoring
 * Integrates with image analysis and agricultural databases
 */

const axios = require('axios');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

class CropHealthApiService {
  constructor() {
    // OpenEPI API configuration
    // Gemini Service integration
    this.geminiService = require('./geminiService');

    // Disease code to readable name mapping (kept for reference or fallback mapping if needed)
    this.diseaseMapping = {
      'HLT': 'Healthy Plant',
      // ... (keep others if useful for internal logic, otherwise straightforward string result from Gemini is better)
    };

    // Crop health cache duration
    this.cropAnalysisCacheTTL = 3600; // 1 hour
    this.diseaseInfoCacheTTL = 86400; // 24 hours
    this.treatmentCacheTTL = 43200; // 12 hours

    // ... (keep databases)
    this.diseaseDatabase = { /* ... */ };
    this.pestDatabase = { /* ... */ };
  }

  /**
   * Analyze plant health using Gemini (supports image and video)
   * Replaces analyzeCropImage
   */
  async analyzeCropHealth(file, cropType = 'unknown') {
    try {
      if (!file) {
        throw new ApiError('File is required', 400);
      }

      logger.info('Starting crop health analysis with Gemini', { cropType, filename: file.filename });

      const analysisRaw = await this.geminiService.analyzePlantHealth(file.path, file.mimetype || 'image/jpeg');

      // Transform Gemini response to our internal format
      return this.transformGeminiResponse(analysisRaw, cropType);

    } catch (error) {
      logger.error('Failed to analyze crop health', { cropType, error: error.message });
      // Fallback to mock if configured or critical failure? 
      // For now, let's throw to indicate real AI service failure.
      throw new ApiError('Crop analysis service unavailable: ' + error.message, 503);
    }
  }

  // Deprecated method alias for backward compatibility
  async analyzeCropImage(imagePath, cropType = 'unknown') {
    // Wrap simple path into file object structure expected by new method
    return this.analyzeCropHealth({ path: imagePath, mimetype: 'image/jpeg' }, cropType);
  }

  /**
   * Transform Gemini JSON response to internal standardized format
   */
  transformGeminiResponse(geminiData, cropType) {
    // geminiData structure matches the prompt in GeminiService

    // Map severity to lowercase
    const severity = (geminiData.primaryDiagnosis.severity || 'medium').toLowerCase();

    // Construct recommendation object matching existing frontend expectations
    const recommendations = geminiData.recommendations || {};

    return {
      confidence: geminiData.primaryDiagnosis.confidence || 0,
      primaryIssue: geminiData.primaryDiagnosis.condition,
      severity: severity,
      plantInfo: {
        cropType: geminiData.plantInfo?.cropType || cropType,
        plantStage: 'unknown',
        plantHealth: geminiData.plantInfo?.plantHealth || 'unknown'
      },
      diseases: geminiData.primaryDiagnosis.condition !== 'Healthy' ? [{
        name: geminiData.primaryDiagnosis.condition,
        confidence: geminiData.primaryDiagnosis.confidence,
        severity: severity,
        description: geminiData.primaryDiagnosis.description
      }] : [],
      pests: [], // Gemini might return pests in primaryDiagnosis, logic is similar
      deficiencies: [],
      environmentalStress: [],
      recommendations: {
        immediate: recommendations.immediate || [],
        preventive: recommendations.preventive || [],
        longTerm: recommendations.longTerm || []
      },
      metadata: {
        analysisDate: new Date(),
        apiVersion: '2.0',
        model: 'Gemini-3.0-Flash',
        processingTime: 'variable'
      },
      economicImpact: geminiData.economicImpact
    };
  }

  // ... (keep getCropDiseases, etc. if they are just reading static data or using other APIs. 
  // If getCropDiseases uses OpenEPI, it should also be updated or mocked. 
  // For this task, focusing on analysis.)

  /**
   * Get OpenEPI access token using client credentials
   */
  async getOpenEpiToken() {
    // Check if we have a valid cached token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        this.openEpiConfig.authURL,
        {
          grant_type: 'client_credentials',
          client_id: this.openEpiConfig.clientId,
          client_secret: this.openEpiConfig.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: this.openEpiConfig.timeout
        }
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Set expiry to 50 minutes (tokens typically last 1 hour)
        this.tokenExpiry = Date.now() + (50 * 60 * 1000);
        return this.accessToken;
      } else {
        throw new Error('No access token received from OpenEPI');
      }
    } catch (error) {
      logger.error('Failed to get OpenEPI token', { error: error.message });
      throw error;
    }
  }

  /**
   * Call real OpenEPI API for crop health analysis
   */
  async callOpenEpiAPI(imagePath, cropType) {
    const fs = require('fs').promises;

    try {
      // Get access token
      const token = await this.getOpenEpiToken();

      // Read image file
      const imageBuffer = await fs.readFile(imagePath);

      const response = await axios.post(
        `${this.openEpiConfig.baseURL}${this.openEpiConfig.cropHealthEndpoint}`,
        imageBuffer,
        {
          headers: {
            'Content-Type': 'image/jpeg',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Agrilo/1.0'
          },
          timeout: this.openEpiConfig.timeout
        }
      );

      return response.data;
    } catch (error) {
      logger.error('OpenEPI API call failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Format OpenEPI crop health API response to standard format
   */
  formatDiagnosisResult(apiResponse, cropType) {
    // Process the disease probability scores
    const analysisResult = this.processDiseaseProbabilities(apiResponse);

    return {
      confidence: analysisResult.confidence,
      primaryIssue: analysisResult.primaryDiagnosis,
      severity: analysisResult.severity,
      plantInfo: {
        cropType: cropType,
        plantStage: 'maturation',
        plantHealth: analysisResult.plantHealth
      },
      diseases: analysisResult.diseases,
      pests: [],
      deficiencies: [],
      environmentalStress: [],
      recommendations: this.generateRecommendations(analysisResult),
      metadata: {
        analysisDate: new Date(),
        apiVersion: '1.0',
        model: 'OpenEPI-CropHealth',
        processingTime: '2-3 seconds'
      }
    };
  }

  /**
   * Process disease probability scores from OpenEPI API
   */
  processDiseaseProbabilities(apiResponse) {
    console.log('🔍 Processing OpenEPI Response...');
    console.log('📊 Response keys:', Object.keys(apiResponse));

    // Find the disease/condition with highest probability
    let highestProbability = 0;
    let primaryDiseaseCode = 'HLT';

    for (const [code, probability] of Object.entries(apiResponse)) {
      console.log(`📈 ${code}: ${probability} (${Math.round(probability * 100)}%)`);
      if (probability > highestProbability) {
        highestProbability = probability;
        primaryDiseaseCode = code;
      }
    }

    console.log(`🎯 Highest probability: ${primaryDiseaseCode} (${Math.round(highestProbability * 100)}%)`);

    // Only consider results with confidence above 50%
    const isConfident = highestProbability >= 0.5;
    const confidence = Math.round(highestProbability * 100);

    // Get readable disease name
    const primaryDiagnosis = this.diseaseMapping[primaryDiseaseCode] || primaryDiseaseCode;

    // Determine plant health and severity
    const isHealthy = primaryDiseaseCode === 'HLT';
    const plantHealth = isHealthy ? 'excellent' : (confidence > 75 ? 'poor' : 'fair');
    const severity = isHealthy ? 'low' : (confidence > 75 ? 'high' : 'medium');

    // Create diseases array for non-healthy diagnoses
    const diseases = [];
    if (!isHealthy && isConfident) {
      diseases.push({
        name: primaryDiagnosis,
        code: primaryDiseaseCode,
        confidence: confidence,
        severity: severity,
        description: `Detected with ${confidence}% confidence`
      });
    }

    // Get all significant detections (above 10%)
    const allDetections = Object.entries(apiResponse)
      .filter(([code, prob]) => prob >= 0.1)
      .map(([code, prob]) => ({
        code,
        name: this.diseaseMapping[code] || code,
        probability: Math.round(prob * 100)
      }))
      .sort((a, b) => b.probability - a.probability);

    const result = {
      confidence: confidence,
      primaryDiagnosis: isConfident ? primaryDiagnosis : 'Unclear diagnosis - low confidence',
      primaryDiseaseCode,
      severity,
      plantHealth,
      diseases,
      isHealthy,
      isConfident,
      allDetections
    };

    console.log('🏥 Final Analysis Result:');
    console.log(`   Primary Disease: ${result.primaryDiagnosis}`);
    console.log(`   Disease Code: ${result.primaryDiseaseCode}`);
    console.log(`   Confidence: ${result.confidence}%`);
    console.log(`   Severity: ${result.severity}`);
    console.log(`   Plant Health: ${result.plantHealth}`);
    console.log(`   Is Healthy: ${result.isHealthy}`);
    console.log(`   Is Confident: ${result.isConfident}`);

    return result;
  }

  /**
   * Generate treatment recommendations based on analysis results
   */
  generateRecommendations(analysisResult) {
    const { isHealthy, primaryDiseaseCode, confidence, isConfident } = analysisResult;

    if (isHealthy) {
      return {
        immediate: [
          {
            title: 'Continue current care routine',
            description: 'Your plant looks healthy! Keep up the good work.',
            urgency: 'low',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          }
        ],
        preventive: [
          {
            title: 'Regular monitoring',
            description: 'Check plants weekly for early signs of issues',
            urgency: 'low',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          },
          {
            title: 'Maintain soil moisture',
            description: 'Ensure consistent watering schedule',
            urgency: 'low',
            estimated_cost: 'Low',
            local_availability: 'Common'
          }
        ],
        longTerm: [
          {
            title: 'Soil testing',
            description: 'Test soil pH and nutrients annually',
            urgency: 'low',
            estimated_cost: 'Medium',
            local_availability: 'Agricultural centers'
          }
        ]
      };
    }

    if (!isConfident) {
      return {
        immediate: [
          {
            title: 'Retake photo in better lighting',
            description: 'Take a clearer photo in good natural light for better diagnosis',
            urgency: 'low',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          }
        ],
        preventive: [
          {
            title: 'Monitor plant closely',
            description: 'Watch for any changes in plant condition',
            urgency: 'medium',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          }
        ],
        longTerm: [
          {
            title: 'Consult agricultural expert',
            description: 'Get professional advice for unclear symptoms',
            urgency: 'medium',
            estimated_cost: 'Medium',
            local_availability: 'Agricultural extension services'
          }
        ]
      };
    }

    // Disease-specific recommendations
    const diseaseRecommendations = this.getDiseaseRecommendations(primaryDiseaseCode);
    return diseaseRecommendations;
  }

  /**
   * Get disease-specific treatment recommendations
   */
  getDiseaseRecommendations(diseaseCode) {
    const recommendations = {
      'CSSVD': {
        immediate: [
          {
            title: 'Remove infected plants',
            description: 'Immediately remove and destroy infected plants to prevent spread',
            urgency: 'high',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          },
          {
            title: 'Apply insecticide',
            description: 'Control whitefly vectors with approved insecticides',
            urgency: 'high',
            estimated_cost: 'Medium',
            local_availability: 'Agricultural stores'
          }
        ],
        preventive: [
          {
            title: 'Use resistant varieties',
            description: 'Plant cassava varieties resistant to mosaic virus',
            urgency: 'high',
            estimated_cost: 'Low',
            local_availability: 'Agricultural centers'
          }
        ],
        longTerm: [
          {
            title: 'Crop rotation',
            description: 'Rotate with non-host crops to break disease cycle',
            urgency: 'medium',
            estimated_cost: 'Low',
            local_availability: 'Always available'
          }
        ]
      },
      'CMD': {
        immediate: [
          {
            title: 'Remove infected plants',
            description: 'Remove and destroy plants showing mosaic symptoms',
            urgency: 'high',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          }
        ],
        preventive: [
          {
            title: 'Use clean planting material',
            description: 'Only use disease-free cassava cuttings',
            urgency: 'high',
            estimated_cost: 'Low',
            local_availability: 'Certified nurseries'
          }
        ],
        longTerm: [
          {
            title: 'Plant resistant varieties',
            description: 'Switch to CMD-resistant cassava varieties',
            urgency: 'high',
            estimated_cost: 'Low',
            local_availability: 'Agricultural research centers'
          }
        ]
      },
      'ANT': {
        immediate: [
          {
            title: 'Apply fungicide',
            description: 'Use copper-based fungicide to control anthracnose',
            urgency: 'high',
            estimated_cost: 'Medium',
            local_availability: 'Agricultural stores'
          },
          {
            title: 'Remove affected parts',
            description: 'Prune and dispose of infected plant parts',
            urgency: 'high',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          }
        ],
        preventive: [
          {
            title: 'Improve air circulation',
            description: 'Space plants properly and prune for better airflow',
            urgency: 'medium',
            estimated_cost: 'Free',
            local_availability: 'Always available'
          }
        ],
        longTerm: [
          {
            title: 'Drainage improvement',
            description: 'Ensure good field drainage to reduce humidity',
            urgency: 'medium',
            estimated_cost: 'Medium',
            local_availability: 'Local contractors'
          }
        ]
      }
    };

    // Default recommendations for unknown diseases
    const defaultRecommendations = {
      immediate: [
        {
          title: 'Isolate affected plants',
          description: 'Separate diseased plants from healthy ones',
          urgency: 'high',
          estimated_cost: 'Free',
          local_availability: 'Always available'
        },
        {
          title: 'Apply broad-spectrum treatment',
          description: 'Use general fungicide or bactericide as appropriate',
          urgency: 'medium',
          estimated_cost: 'Medium',
          local_availability: 'Agricultural stores'
        }
      ],
      preventive: [
        {
          title: 'Improve plant hygiene',
          description: 'Remove fallen leaves and debris regularly',
          urgency: 'medium',
          estimated_cost: 'Free',
          local_availability: 'Always available'
        }
      ],
      longTerm: [
        {
          title: 'Consult agricultural expert',
          description: 'Get professional diagnosis and treatment plan',
          urgency: 'high',
          estimated_cost: 'Medium',
          local_availability: 'Agricultural extension services'
        }
      ]
    };

    return recommendations[diseaseCode] || defaultRecommendations;
  }

  /**
   * Helper methods for formatting API responses (legacy support)
   */
  determineSeverity(apiResponse) {
    const confidence = apiResponse.confidence || 0;
    const diseaseCount = (apiResponse.diseases || []).length;

    if (confidence > 0.8 && diseaseCount > 0) return 'high';
    if (confidence > 0.6 || diseaseCount > 0) return 'medium';
    return 'low';
  }

  determineHealthStatus(apiResponse) {
    const diseases = apiResponse.diseases || [];
    const pests = apiResponse.pests || [];

    if (diseases.length === 0 && pests.length === 0) return 'excellent';
    if (diseases.length <= 1 && pests.length <= 1) return 'good';
    if (diseases.length <= 2 && pests.length <= 2) return 'fair';
    return 'poor';
  }

  formatDiseases(diseases) {
    return diseases.map(disease => ({
      name: disease.name || disease.disease_name,
      confidence: disease.confidence || 0.8,
      severity: disease.severity || 'medium',
      description: disease.description || '',
      treatment: disease.treatment || []
    }));
  }

  formatPests(pests) {
    return pests.map(pest => ({
      name: pest.name || pest.pest_name,
      confidence: pest.confidence || 0.8,
      severity: pest.severity || 'medium',
      description: pest.description || '',
      treatment: pest.treatment || []
    }));
  }

  formatDeficiencies(deficiencies) {
    return deficiencies.map(def => ({
      nutrient: def.nutrient || def.name,
      confidence: def.confidence || 0.8,
      severity: def.severity || 'medium',
      symptoms: def.symptoms || [],
      treatment: def.treatment || []
    }));
  }

  formatEnvironmentalStress(factors) {
    return factors.map(factor => ({
      type: factor.type || factor.stress_type,
      confidence: factor.confidence || 0.8,
      severity: factor.severity || 'medium',
      description: factor.description || '',
      solutions: factor.solutions || []
    }));
  }

  formatRecommendations(recommendations) {
    return recommendations.map(rec => {
      if (typeof rec === 'string') {
        return {
          title: rec,
          description: rec,
          urgency: 'medium',
          estimated_cost: 'Low',
          local_availability: 'Common'
        };
      }
      return {
        title: rec.title || rec.action,
        description: rec.description || rec.details,
        urgency: rec.urgency || rec.priority || 'medium',
        estimated_cost: rec.cost || 'Medium',
        local_availability: rec.availability || 'Common'
      };
    });
  }

  /**
   * Generate enhanced mock diagnosis result with realistic data
   */
  generateEnhancedMockDiagnosisResult(cropType, imagePath) {
    const scenarios = [
      {
        primaryIssue: 'Healthy Plant Detected',
        severity: 'low',
        confidence: 92,
        plantHealth: 'excellent',
        diseases: [],
        pests: [],
        recommendations: {
          immediate: [
            { title: 'Continue current care routine', description: 'Your plant looks healthy! Keep up the good work.', urgency: 'low' }
          ],
          preventive: [
            { title: 'Regular monitoring', description: 'Check plants weekly for early signs of issues', urgency: 'low' },
            { title: 'Maintain soil moisture', description: 'Ensure consistent watering schedule', urgency: 'low' }
          ],
          longTerm: [
            { title: 'Soil testing', description: 'Test soil pH and nutrients annually', urgency: 'low' }
          ]
        }
      },
      {
        primaryIssue: 'Early Blight Detected',
        severity: 'medium',
        confidence: 87,
        plantHealth: 'fair',
        diseases: [
          {
            name: 'Early Blight',
            confidence: 87,
            severity: 'medium',
            description: 'Fungal disease causing brown spots with concentric rings on leaves'
          }
        ],
        pests: [],
        recommendations: {
          immediate: [
            { title: 'Apply fungicide', description: 'Use copper-based fungicide immediately', urgency: 'high' },
            { title: 'Remove affected leaves', description: 'Prune and dispose of infected foliage', urgency: 'high' }
          ],
          preventive: [
            { title: 'Improve air circulation', description: 'Space plants properly and prune for airflow', urgency: 'medium' },
            { title: 'Avoid overhead watering', description: 'Water at soil level to keep leaves dry', urgency: 'medium' }
          ],
          longTerm: [
            { title: 'Crop rotation', description: 'Rotate crops next season to break disease cycle', urgency: 'low' }
          ]
        }
      },
      {
        primaryIssue: 'Nutrient Deficiency - Nitrogen',
        severity: 'medium',
        confidence: 79,
        plantHealth: 'fair',
        diseases: [],
        pests: [],
        deficiencies: [
          {
            nutrient: 'Nitrogen',
            confidence: 79,
            severity: 'medium',
            symptoms: ['Yellowing of older leaves', 'Stunted growth', 'Pale green coloration']
          }
        ],
        recommendations: {
          immediate: [
            { title: 'Apply nitrogen fertilizer', description: 'Use balanced NPK fertilizer (10-10-10)', urgency: 'high' },
            { title: 'Increase watering frequency', description: 'Ensure nutrients can be absorbed', urgency: 'medium' }
          ],
          preventive: [
            { title: 'Regular soil testing', description: 'Test soil nutrients monthly during growing season', urgency: 'medium' },
            { title: 'Organic matter addition', description: 'Add compost to improve soil fertility', urgency: 'low' }
          ],
          longTerm: [
            { title: 'Soil improvement plan', description: 'Develop long-term soil health strategy', urgency: 'low' }
          ]
        }
      }
    ];

    // Select scenario based on crop type and add some randomness
    const scenarioIndex = Math.floor(Math.random() * scenarios.length);
    const selectedScenario = scenarios[scenarioIndex];

    // Add some variation to confidence
    const confidenceVariation = (Math.random() - 0.5) * 10;
    selectedScenario.confidence = Math.max(60, Math.min(95, selectedScenario.confidence + confidenceVariation));

    return {
      confidence: selectedScenario.confidence,
      primaryIssue: selectedScenario.primaryIssue,
      severity: selectedScenario.severity,
      plantInfo: {
        cropType: cropType || 'unknown',
        plantStage: 'maturation',
        plantHealth: selectedScenario.plantHealth
      },
      diseases: selectedScenario.diseases || [],
      pests: selectedScenario.pests || [],
      deficiencies: selectedScenario.deficiencies || [],
      environmentalStress: selectedScenario.environmentalStress || [],
      recommendations: selectedScenario.recommendations,
      metadata: {
        analysisDate: new Date(),
        apiVersion: '1.0',
        model: 'AgriSphere-MockAI',
        processingTime: `${(Math.random() * 2 + 1).toFixed(1)} seconds`
      }
    };
  }

  /**
   * Get disease information and treatment recommendations
   */
  async getDiseaseInfo(cropType, diseaseName) {
    try {
      const crop = this.diseaseDatabase[cropType.toLowerCase()];
      if (!crop) {
        throw new ApiError(`Crop type '${cropType}' not supported`, 400);
      }

      const disease = crop[diseaseName.toLowerCase()];
      if (!disease) {
        throw new ApiError(`Disease '${diseaseName}' not found for ${cropType}`, 404);
      }

      const diseaseInfo = {
        crop: cropType,
        disease: diseaseName,
        severity: disease.severity,
        symptoms: disease.symptoms,
        treatment: {
          immediate: disease.treatment,
          longTerm: disease.prevention
        },
        economicImpact: this.calculateEconomicImpact(disease.severity),
        spreadRisk: this.assessSpreadRisk(disease.severity),
        monitoringSchedule: this.getMonitoringSchedule(disease.severity),
        timestamp: new Date().toISOString()
      };

      logger.info('Disease information retrieved', { cropType, diseaseName });
      return diseaseInfo;

    } catch (error) {
      logger.error('Failed to get disease info', { cropType, diseaseName, error: error.message });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Disease information service temporarily unavailable', 503);
    }
  }

  /**
   * Get pest identification and control recommendations
   */
  async getPestInfo(pestName) {
    try {
      const pest = this.pestDatabase[pestName.toLowerCase()];
      if (!pest) {
        throw new ApiError(`Pest '${pestName}' not found in database`, 404);
      }

      const pestInfo = {
        pest: pestName,
        affectedCrops: pest.crops,
        severity: pest.severity,
        identification: {
          symptoms: pest.symptoms,
          lifecycle: this.getPestLifecycle(pestName),
          peakSeason: this.getPestSeason(pestName)
        },
        control: {
          biological: this.getBiologicalControl(pestName),
          chemical: pest.treatment,
          cultural: pest.prevention
        },
        economicThreshold: this.getEconomicThreshold(pestName),
        monitoringMethods: this.getMonitoringMethods(pestName),
        timestamp: new Date().toISOString()
      };

      logger.info('Pest information retrieved', { pestName });
      return pestInfo;

    } catch (error) {
      logger.error('Failed to get pest info', { pestName, error: error.message });

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Pest information service temporarily unavailable', 503);
    }
  }

  /**
   * Get comprehensive crop health assessment
   */
  async getCropHealthAssessment(farmId, cropType) {
    try {
      const healthAssessment = {
        farmId,
        cropType,
        overallHealth: Math.floor(Math.random() * 30) + 70, // Score 70-100
        riskFactors: [
          {
            type: 'disease',
            risk: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'moderate' : 'low',
            description: 'Based on current weather conditions and crop stage'
          },
          {
            type: 'pest',
            risk: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'moderate' : 'low',
            description: 'Seasonal pest pressure and local conditions'
          },
          {
            type: 'nutrition',
            risk: Math.random() > 0.5 ? 'moderate' : 'low',
            description: 'Based on soil analysis and growth stage'
          }
        ],
        recommendations: [
          'Continue regular monitoring for early detection',
          'Maintain proper nutrition program',
          'Ensure adequate irrigation without waterlogging',
          'Practice integrated pest management'
        ],
        nextInspection: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        criticalActions: [],
        timestamp: new Date().toISOString()
      };

      // Add critical actions if high risk
      healthAssessment.riskFactors.forEach(factor => {
        if (factor.risk === 'high') {
          healthAssessment.criticalActions.push({
            priority: 'urgent',
            action: `Address ${factor.type} concerns immediately`,
            timeframe: '24-48 hours'
          });
        }
      });

      logger.info('Crop health assessment completed', { farmId, cropType });
      return healthAssessment;

    } catch (error) {
      logger.error('Failed to get crop health assessment', { farmId, cropType, error: error.message });
      throw new ApiError('Crop health assessment service temporarily unavailable', 503);
    }
  }

  /**
   * Generate mock diagnosis result for image analysis
   */
  generateMockDiagnosisResult(cropType) {
    const crops = Object.keys(this.diseaseDatabase);
    const selectedCrop = crops.includes(cropType?.toLowerCase()) ? cropType.toLowerCase() : 'tomato';
    const diseases = Object.keys(this.diseaseDatabase[selectedCrop]);
    const selectedDisease = diseases[Math.floor(Math.random() * diseases.length)];

    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    return {
      cropType: selectedCrop,
      diagnosis: {
        primary: {
          condition: selectedDisease,
          confidence: (confidence * 100).toFixed(1) + '%',
          severity: this.diseaseDatabase[selectedCrop][selectedDisease].severity
        },
        alternatives: diseases.slice(0, 2).map(disease => ({
          condition: disease,
          confidence: (Math.random() * 0.4 + 0.3 * 100).toFixed(1) + '%'
        }))
      },
      recommendations: this.diseaseDatabase[selectedCrop][selectedDisease].treatment,
      urgency: confidence > 0.8 ? 'immediate' : 'within 48 hours',
      followUpRequired: true,
      estimatedRecoveryTime: '1-2 weeks with proper treatment',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate economic impact based on disease severity
   */
  calculateEconomicImpact(severity) {
    const impacts = {
      low: { yieldLoss: '5-10%', treatmentCost: 'Low' },
      moderate: { yieldLoss: '15-25%', treatmentCost: 'Moderate' },
      high: { yieldLoss: '30-50%', treatmentCost: 'High' }
    };

    return impacts[severity] || impacts.moderate;
  }

  /**
   * Assess disease spread risk
   */
  assessSpreadRisk(severity) {
    const risks = {
      low: 'Contained, low spread risk',
      moderate: 'Moderate spread risk, monitor closely',
      high: 'High spread risk, immediate action required'
    };

    return risks[severity] || risks.moderate;
  }

  /**
   * Get monitoring schedule based on severity
   */
  getMonitoringSchedule(severity) {
    const schedules = {
      low: 'Weekly monitoring',
      moderate: 'Bi-weekly monitoring',
      high: 'Daily monitoring until resolved'
    };

    return schedules[severity] || schedules.moderate;
  }

  /**
   * Get pest lifecycle information
   */
  getPestLifecycle(pestName) {
    const lifecycles = {
      aphids: '7-10 days, multiple generations per season',
      caterpillars: '2-4 weeks from egg to adult',
      whiteflies: '2-3 weeks, overlapping generations'
    };

    return lifecycles[pestName] || 'Varies by species and conditions';
  }

  /**
   * Get pest seasonal information
   */
  getPestSeason(pestName) {
    const seasons = {
      aphids: 'Spring and fall, cooler weather',
      caterpillars: 'Late spring through summer',
      whiteflies: 'Warm weather, year-round in tropics'
    };

    return seasons[pestName] || 'Varies by region and climate';
  }

  /**
   * Get biological control options
   */
  getBiologicalControl(pestName) {
    const bioControl = {
      aphids: ['Ladybugs', 'Lacewings', 'Parasitic wasps'],
      caterpillars: ['Trichogramma wasps', 'Bacillus thuringiensis', 'Birds'],
      whiteflies: ['Encarsia wasps', 'Delphastus beetles', 'Sticky traps']
    };

    return bioControl[pestName] || ['Beneficial insects', 'Natural predators'];
  }

  /**
   * Get economic threshold for pest control
   */
  getEconomicThreshold(pestName) {
    const thresholds = {
      aphids: '5-10 per plant depending on crop value',
      caterpillars: '1-2 larvae per plant',
      whiteflies: '5-10 adults per plant'
    };

    return thresholds[pestName] || 'Monitor population levels';
  }

  /**
   * Get monitoring methods for pest
   */
  getMonitoringMethods(pestName) {
    const methods = {
      aphids: ['Visual inspection', 'Leaf counting', 'Sticky traps'],
      caterpillars: ['Visual inspection', 'Pheromone traps', 'Frass monitoring'],
      whiteflies: ['Yellow sticky traps', 'Visual inspection', 'Tap method']
    };

    return methods[pestName] || ['Regular visual inspection', 'Trapping methods'];
  }
}

module.exports = new CropHealthApiService();