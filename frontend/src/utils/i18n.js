// Supported languages with their configurations
export const SUPPORTED_LANGUAGES = {
    en: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        direction: 'ltr'
    },
    es: {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        direction: 'ltr'
    },
    fr: {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        direction: 'ltr'
    },
    hi: {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        flag: '🇮🇳',
        direction: 'ltr'
    }
}

// Translation strings
export const TRANSLATIONS = {
    en: {
        // Common
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        next: 'Next',
        back: 'Back',
        continue: 'Continue',
        skip: 'Skip',
        retry: 'Retry',

        // Navigation
        home: 'Home',
        dashboard: 'Dashboard',
        farm: 'Farm',
        diagnosis: 'Diagnosis',
        irrigation: 'Irrigation',
        planning: 'Planning',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',

        // Auth
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        phoneNumber: 'Phone Number',
        firstName: 'First Name',
        lastName: 'Last Name',

        // Farm
        myFarms: 'My Farms',
        addFarm: 'Add Farm',
        farmName: 'Farm Name',
        farmSize: 'Farm Size',
        location: 'Location',
        crops: 'Crops',

        // Common Actions
        getStarted: 'Get Started',
        learnMore: 'Learn More',
        takePhoto: 'Take Photo',
        uploadPhoto: 'Upload Photo',
        getCurrentLocation: 'Get Current Location',
        enableLocation: 'Enable Location',

        // Status
        online: 'Online',
        offline: 'Offline',
        syncing: 'Syncing...',
        healthy: 'Healthy',
        warning: 'Warning',
        critical: 'Critical',

        // Greetings
        goodMorning: 'Good Morning',
        goodAfternoon: 'Good Afternoon',
        goodEvening: 'Good Evening',
        welcome: 'Welcome',
        welcomeBack: 'Welcome Back',

        // App specific
        appName: 'Agrilo',
        tagline: 'AI-powered farming assistant',
        cropHealth: 'Crop Health',
        waterManagement: 'Water Management',
        farmPlanning: 'Farm Planning',

        // Placeholder for missing translations
        translationMissing: 'Translation missing',

        // Home Page
        homeTitle1: 'Smart Farming',
        homeTitle2: 'Made Simple',
        homeSubtitle: 'Empowering smallholder farmers with AI-powered insights, crop health monitoring, and smart irrigation management.',
        farmManagement: 'Farm Management',
        farmManagementDesc: 'GPS-based field mapping and boundary management',
        cropHealthDesc: 'AI-powered crop disease detection and treatment recommendations',
        waterManagementDesc: 'Smart irrigation planning based on weather and soil conditions',
        farmPlanningDesc: 'Seasonal crop rotation and harvest planning assistance',
        goToDashboard: 'Go to Dashboard',
        openDashboard: 'Open Dashboard',
        startFreeToday: 'Start Free Today',
        alreadyMember: 'Already a Member?',
        featuresTitle: 'Everything You Need to Farm Smarter',
        featuresSubtitle: 'Comprehensive tools designed specifically for smallholder farmers',
        // Profile
        manageProfile: 'Manage your farming profile and achievements',
        saveChanges: 'Save Changes',
        farmer: 'Farmer',
        verifiedAccount: 'Verified Account',
        totalFarmSize: 'Total Farm Size',
        hectares: 'hectares',
        achievements: 'Achievements',
        noAchievements: 'No achievements yet. Start farming to earn achievements!',
        yourStats: 'Your Stats',
        profileCompletion: 'Profile Completion',
        profileProgress: 'Profile Progress',
        addPhotosPrompt: 'Add farm photos to reach 100%',
        quickActions: 'Quick Actions',
        updateProfile: 'Update Farming Profile',
        changePassword: 'Change Password',
        privacySettings: 'Privacy Settings',
        totalFarms: 'Total Farms',
        diagnosesMade: 'Diagnoses Made',
        waterSaved: 'Water Saved (L)',
        daysActive: 'Days Active',
        earned: 'Earned',
        firstDiagnosis: 'First Diagnosis',
        firstDiagnosisDesc: 'Completed your first crop health check',
        waterSaver: 'Water Saver',
        waterSaverDesc: 'Saved significant water through smart irrigation',
        farmManager: 'Farm Manager',
        farmManagerDesc: 'Successfully set up your first farm',
        dedicatedFarmer: 'Dedicated Farmer',
        dedicatedFarmerDesc: 'Been using Agrilo for over a month',

        // Weather Widget
        currentWeather: 'Current Weather',
        weatherUnavailable: 'Weather Data Unavailable',
        gps: 'GPS',
        realDataRequired: 'Real weather data required',
        humidity: 'Humidity',
        wind: 'Wind',
        uvIndex: 'UV Index',
        forecast: '3-Day Forecast',
        weatherAlert: 'Weather Alert',

        // Risk Analysis Widget
        aiRiskAnalysis: 'AI Risk Analysis',
        satelliteDiagnostics: 'Real-time satellite diagnostics',
        live: 'LIVE',
        droughtRisk: 'Drought Risk',
        floodRisk: 'Flood Risk',
        analysisUnavailable: 'Analysis unavailable',
        retryAnalysis: 'Retry Analysis',
        analyzingData: 'Analyzing satellite data...',
        basedOnHistory: 'Based on 20y historical data',
        updated: 'Updated',
        riskLevels: {
            low: 'Low',
            moderate: 'Moderate',
            high: 'High',
            poor: 'Poor',
            excellent: 'Excellent',
            good: 'Good'
        },

        // Tool Card
        openTool: 'Open Tool',
        topRated: 'TOP RATED',
        stats: {
            usage: 'usage',
            accuracy: 'accuracy',
            success: 'success',
            savings: 'savings',
            efficiency: 'efficiency',
            active: 'active',
            alerts: 'alerts'
        },

        // Urgent Task Card
        allCaughtUp: 'All Caught Up!',
        noUrgentTasks: 'No urgent tasks for today',
        greatJob: 'Great job staying on top of your farm management!',
        todaysPriority: 'Today\'s Priority Task',
        completeToTrack: 'Complete this to stay on track',
        points: 'points',
        completeTask: 'Complete Task',
        completing: 'Completing...',
        completedJob: 'Completed! Great Job!',
        taskCompletedSuccess: 'Task Completed Successfully!',

        // AI Doctor
        doctor: {
            title: 'AI Crop Doctor',
            subtitle: 'Get instant diagnosis for your plants with AI-powered analysis',
            stats: {
                diagnoses: 'Diagnoses',
                accuracy: 'Accuracy',
                rating: 'Rating'
            },
            methods: {
                camera: {
                    title: 'AI Crop Doctor',
                    subtitle: 'Instant Photo Diagnosis',
                    description: 'Take a photo for instant AI-powered plant health analysis',
                    features: {
                        realtime: 'Real-time analysis',
                        detection: 'Disease detection',
                        treatment: 'Treatment advice'
                    }
                },
                upload: {
                    title: 'Gallery Upload',
                    subtitle: 'Analyze Existing Photos',
                    description: 'Upload photos from your gallery for analysis',
                    features: {
                        multiple: 'Multiple photos',
                        batch: 'Batch analysis',
                        history: 'History tracking'
                    }
                },
                symptoms: {
                    title: 'Symptom Checker',
                    subtitle: 'Manual Diagnosis',
                    description: 'Describe symptoms for personalized recommendations',
                    features: {
                        guide: 'Step-by-step guide',
                        expert: 'Expert knowledge',
                        offline: 'Offline support'
                    }
                }
            },
            camera: {
                accessDenied: 'Camera access denied. Please allow camera permissions and try again.',
                perfect: '🌱 Perfect!',
                guidance: 'Center the plant and ensure good lighting',
                analyze: 'Analyze',
                greatShot: 'Great Shot!'
            },
            analysis: {
                title: 'AI Analysis in Progress',
                description: 'Our AI is carefully examining your plant photos...',
                complete: 'Complete',
                steps: {
                    uploading: 'Uploading images',
                    processing: 'Processing with AI',
                    identifying: 'Identifying issues',
                    generating: 'Generating recommendations'
                }
            },
            results: {
                complete: 'Diagnosis Complete!',
                found: "Here's what our AI found",
                plantHealth: 'Plant Health:',
                confidence: 'Confidence:',
                treatmentPlan: 'Treatment Plan',
                priority: 'priority',
                newDiagnosis: 'New Diagnosis',
                saveHistory: 'Save to History',
                share: 'Share Results',
                unknown: 'Unknown'
            },
            symptomChecker: {
                title: 'Symptom Checker',
                comingSoon: 'Coming Soon',
                featureComingSoon: 'Feature Coming Soon',
                description: "We're working hard to bring you an advanced symptom checker with AI-powered diagnosis. This feature will help you identify plant problems step-by-step.",
                aiPowered: 'AI-Powered',
                aiDest: 'Advanced machine learning for accurate diagnosis',
                stepByStep: 'Step-by-Step',
                stepDesc: 'Guided questions for precise identification',
                expertAdvice: 'Expert Advice',
                expertDesc: 'Professional treatment recommendations',
                back: 'Back to Diagnosis'
            },
            errors: {
                oops: 'Oops! Something went wrong',
                tryAgain: 'Try Again'
            }
        },

        ctaTitle: 'Ready to Transform Your Farming?',
        ctaSubtitle: 'Join Agrilo today and experience the future of agriculture',

        // Login/Register
        signInToAssistant: 'Sign in to your farming assistant',
        unexpectedError: 'An unexpected error occurred',
        enterPhone: 'Enter your phone number',
        enterPassword: 'Enter your password',
        dontHaveAccount: 'Don\'t have an account?',
        joinAgrilo: 'Join Agrilo',
        createAccountTitle: 'Create your farming assistant account',
        passwordsNoMatch: 'Passwords do not match',
        registrationFailed: 'Registration failed. Please try again.',
        personalInfo: 'Personal Information',
        experienceLevel: 'Experience Level',
        farmingProfileHeader: 'Farming Profile',
        farmingType: 'Farming Type',
        primaryCrops: 'Primary Crops (Select all that apply)',
        // Crops
        maize: 'Maize/Corn',
        rice: 'Rice',
        wheat: 'Wheat',
        tomatoes: 'Tomatoes',
        potatoes: 'Potatoes',
        beans: 'Beans',
        cassava: 'Cassava',
        sorghum: 'Sorghum',
        farmSizeHectares: 'Farm Size (hectares)',
        locationSecurity: 'Location & Security',
        country: 'Country',
        regionState: 'Region/State',
        gettingLocation: 'Getting Location...',
        getLocation: 'Get Location',
        locationSet: 'Location set',
        createAccount: 'Create Account',
        alreadyHaveAccount: 'Already have an account?',

        // Dashboard
        loadingDashboard: 'Loading your farm dashboard...',
        completeFarmSetup: 'Complete Your Farm Setup',
        setupFarmDesc: 'Set up your farm to unlock the full dashboard experience',
        completeSetup: 'Complete Setup',
        dashboardUnavailable: 'Dashboard Unavailable',
        dashboardError: 'Unable to load dashboard data. Please try refreshing the page.',
        refreshPage: 'Refresh Page',
        yourFarm: 'Your Farm',
        coordinates: 'Coordinates',
        aiCropDoctor: 'AI Crop Doctor',
        instantDiagnosis: 'Instant plant diagnosis',
        snapPhotoDesc: 'Snap a photo for instant plant health analysis',
        climateSmartPlanner: 'Climate-Smart Planner',
        perfectTiming: 'Perfect timing, every season',
        planCropsDesc: 'Plan your crops with weather intelligence',
        smartIrrigationAdvisor: 'Smart Irrigation Advisor',
        waterSmarter: 'Water smarter, not harder',
        optimizeWaterDesc: 'Optimize water usage with AI recommendations',
        interactiveFarmMap: 'Interactive Farm Map',
        visualizeFields: 'Visualize your fields',
        trackFarmStatusDesc: 'Track farm status and report issues on the map',
        farmingToolkit: 'Your Farming Toolkit',
        chooseAction: 'Choose your next action',
        cropGrowthProgress: 'Crop Growth Progress',
        stage: 'stage',
        grown: 'grown',
        daysToHarvest: 'days to harvest',
        analytics: 'Analytics',
        learning: 'Learning',
        support: 'Support',

        // Irrigation Planning
        // Irrigation Planning
        irrigationPage: {
            title: 'Smart Irrigation Advisor',
            subtitle: 'AI-powered irrigation recommendations for optimal crop health',
            loadingFarms: 'Loading farms...',
            noFarms: 'No Farms Available',
            noFarmsDesc: "You don't have any farms set up yet. Create a farm first to get irrigation recommendations.",
            goToFarm: 'Go to Farm Management',
            checkStatus: 'Check Irrigation Status',
            backToFarms: '← Back to Farms',
            limitedData: 'Limited Data Available',
            dataReliability: 'Data Reliability',
            unknown: 'Unknown',
            status: {
                urgent: 'Urgent Irrigation',
                needed: 'Irrigation Needed',
                skip: 'Skip Irrigation',
                optimal: 'Optimal Moisture',
                monitor: 'Monitor Status'
            },
            recommended: 'Recommended',
            optimalTimes: 'Optimal Irrigation Times',
            avoidTimes: 'Avoid These Times',
            conservationTips: 'Water Conservation Tips',
            impact: 'Environmental Impact',
            cost: 'Cost Estimate',
            soilMoisture: 'Soil Moisture Analysis',
            current: 'Current',
            capacity: 'Capacity',
            evapo: 'Evapotranspiration Data',
            soilProps: 'Soil Properties',
            weather: 'Current Weather',
            airQuality: 'Air Quality',
            unavailable: 'Irrigation Data Unavailable',
            unavailableDesc: 'Unable to provide irrigation recommendations due to insufficient real data for this location.',
            requirements: 'Data Requirements'
        },

        // Crop Planning
        // Crop Planning
        planningPage: {
            title: 'Climate-Smart Planner',
            subtitle: 'AI-powered crop recommendations for changing climate conditions',
            getRecs: 'Get Recommendations',
            preferences: 'Tell us about your preferences',
            prefSubtitle: 'This helps us provide better crop recommendations',
            experience: 'Experience Level',
            budget: 'Budget Range',
            market: 'Market Access',
            risk: 'Risk Tolerance',
            getRecsBtn: 'Get Recommendations →',
            adjustPref: '← Adjust Preferences',
            recsFor: 'Crop Recommendations for',
            recsSubtitle: 'Climate-smart suggestions based on your preferences',
            topRecs: 'Top 3 Recommendations',
            seasonalCalendar: 'Seasonal Planting Calendar',
            months: 'Months',
            climateAdaptation: 'Climate Adaptation Strategies',
            strategies: 'Strategies',
            affectedCrops: 'Affected Crops',
            viewDetails: 'View Details',
            quickPreview: 'Quick Preview',
            basicInfo: 'Basic Information',
            economicAnalysis: 'Economic Analysis',
            waterRequirements: 'Water Requirements',
            plantingSchedule: 'Planting Schedule',
            benefits: 'Benefits',
            challenges: 'Challenges',
            riskFactors: 'Risk Factors',
            keyFeatures: 'Key Features'
        },

        // Farm Map
        // Farm Map
        farmMapPage: {
            myFarms: 'My Farms',
            loading: 'Loading farms...',
            noFarms: 'No farms added yet.',
            nearbyAlerts: 'Nearby Alerts',
            noAlerts: 'No nearby issues reported.',
            reportIssue: 'Report Issue',
            issueType: 'Issue Type',
            severity: 'Severity',
            description: 'Description',
            submit: 'Submit Report',
            cancel: 'Cancel',
            success: 'Issue reported successfully!',
            failed: 'Failed to report issue.',
            deleteConfirm: 'Are you sure you want to delete this issue?',
            types: {
                pest: 'Pest Infestation',
                disease: 'Crop Disease',
                fire: 'Fire Hazard',
                flood: 'Flood Risk',
                drought: 'Severe Drought',
                other: 'Other'
            },
            severities: {
                low: 'Low - Monitor',
                medium: 'Medium - Action Needed',
                high: 'High - Urgent',
                critical: 'Critical - Immediate Danger'
            }
        }
    },

    // Spanish translations
    es: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        home: 'Inicio',
        dashboard: 'Panel',
        farm: 'Granja',
        diagnosis: 'Diagnóstico',
        irrigation: 'Irrigación',
        planning: 'Planificación',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        appName: 'Agrilo',
        tagline: 'Asistente agrícola con IA',
        welcome: 'Bienvenido',
        translationMissing: 'Traducción faltante',
        homeTitle1: 'Agricultura Inteligente',
        homeTitle2: 'Simplificada',
        homeSubtitle: 'Empowering smallholder farmers with AI-powered insights, crop health monitoring, and smart irrigation management.',
        farmManagement: 'Farm Management',
        farmManagementDesc: 'GPS-based field mapping and boundary management',
        cropHealthDesc: 'AI-powered crop disease detection and treatment recommendations',
        waterManagementDesc: 'Smart irrigation planning based on weather and soil conditions',
        farmPlanningDesc: 'Seasonal crop rotation and harvest planning assistance',
        goToDashboard: 'Ir al Panel',
        openDashboard: 'Abrir Panel',
        startFreeToday: 'Comience Gratis Hoy',
        alreadyMember: '¿Ya eres miembro?',
        featuresTitle: 'Todo lo que necesitas para cultivar de manera más inteligente',
        featuresSubtitle: 'Herramientas integrales diseñadas específicamente para pequeños agricultores',
        ctaTitle: '¿Listo para transformar tu agricultura?',
        ctaSubtitle: 'Únete a Agrilo hoy y experimenta el futuro de la agricultura'
    },

    // French translations
    fr: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        save: 'Sauvegarder',
        home: 'Accueil',
        dashboard: 'Tableau de Bord',
        farm: 'Ferme',
        diagnosis: 'Diagnostic',
        irrigation: 'Irrigation',
        planning: 'Planification',
        login: 'Se Connecter',
        register: 'S\'inscrire',
        appName: 'Agrilo',
        tagline: 'Assistant agricole IA',
        welcome: 'Bienvenue',
        translationMissing: 'Traduction manquante',
        homeTitle1: 'Agriculture Intelligente',
        homeTitle2: 'Simplifiée',
        homeSubtitle: 'Empowering smallholder farmers with AI-powered insights, crop health monitoring, and smart irrigation management.',
        farmManagement: 'Gestion Agricole',
        farmManagementDesc: 'GPS-based field mapping and boundary management',
        cropHealthDesc: 'AI-powered crop disease detection and treatment recommendations',
        waterManagementDesc: 'Smart irrigation planning based on weather and soil conditions',
        farmPlanningDesc: 'Seasonal crop rotation and harvest planning assistance',
        goToDashboard: 'Aller au Tableau de Bord',
        openDashboard: 'Ouvrir le Tableau de Bord',
        startFreeToday: 'Commencez Gratuitement',
        alreadyMember: 'Déjà membre?',
        featuresTitle: 'Tout ce dont vous avez besoin pour cultiver plus intelligemment',
        featuresSubtitle: 'Outils complets conçus spécifiquement pour les petits exploitants',
        ctaTitle: 'Prêt à transformer votre agriculture?',
        ctaSubtitle: 'Rejoignez Agrilo aujourd\'hui et découvrez l\'avenir de l\'agriculture'
    },

    // Hindi translations
    hi: {
        // Common
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफल',
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        save: 'सहेजें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        add: 'जोड़ें',
        search: 'खोजें',
        next: 'अगला',
        back: 'पीछे',
        continue: 'जारी रखें',
        skip: 'छोड़ें',
        retry: 'पुनः प्रयास करें',

        // Navigation
        home: 'होम',
        dashboard: 'डैशबोर्ड',
        farm: 'खेत',
        diagnosis: 'निदान',
        irrigation: 'सिंचाई',
        planning: 'योजना',
        profile: 'प्रोफाइल',
        settings: 'सेटिंग्स',
        logout: 'लॉग आउट',

        // Auth
        login: 'लॉग इन',
        register: 'रजिस्टर',
        email: 'ईमेल',
        password: 'पासवर्ड',
        confirmPassword: 'पासवर्ड की पुष्टि करें',
        forgotPassword: 'पासवर्ड भूल गए?',
        phoneNumber: 'फ़ोन नंबर',
        firstName: 'पहला नाम',
        lastName: 'अंतिम नाम',

        // Farm
        myFarms: 'मेरे खेत',
        addFarm: 'खेत जोड़ें',
        farmName: 'खेत का नाम',
        farmSize: 'खेत का आकार',
        location: 'स्थान',
        crops: 'फसलें',

        // Common Actions
        getStarted: 'शुरू करें',
        learnMore: 'और जानें',
        takePhoto: 'फोटो लें',
        uploadPhoto: 'फोटो अपलोड करें',
        getCurrentLocation: 'वर्तमान स्थान प्राप्त करें',
        enableLocation: 'स्थान सक्षम करें',

        // Status
        online: 'ऑनलाइन',
        offline: 'ऑफ़लाइन',
        syncing: 'सिंक हो रहा है...',
        healthy: 'स्वस्थ',
        warning: 'चेतावनी',
        critical: 'गंभीर',

        // Greetings
        goodMorning: 'शुभ प्रभात',
        goodAfternoon: 'शुभ दोपहर',
        goodEvening: 'शुभ संध्या',
        welcome: 'स्वागत है',
        welcomeBack: 'वापसी पर स्वागत है',

        // App specific
        appName: 'एग्रीलो',
        tagline: 'एआई-संचालित कृषि सहायक',
        cropHealth: 'फसल स्वास्थ्य',
        waterManagement: 'जल प्रबंधन',
        farmPlanning: 'खेत योजना',

        // Placeholder for missing translations
        translationMissing: 'अनुवाद गायब है',

        // Home Page
        homeTitle1: 'स्मार्ट खेती',
        homeTitle2: 'हुई आसान',
        homeSubtitle: 'एआई-संचालित अंतर्दृष्टि, फसल स्वास्थ्य निगरानी और स्मार्ट सिंचाई प्रबंधन के साथ छोटे किसानों को सशक्त बनाना।',
        farmManagement: 'खेत प्रबंधन',
        farmManagementDesc: 'जीपीएस-आधारित खेत मानचित्रण और सीमा प्रबंधन',
        cropHealthDesc: 'एआई-संचालित फसल रोग पहचान और उपचार सिफारिशें',
        waterManagementDesc: 'मौसम और मिट्टी की स्थिति पर आधारित स्मार्ट सिंचाई योजना',
        farmPlanningDesc: 'मौसमी फसल रोटेशन और फसल योजना सहायता',
        goToDashboard: 'डैशबोर्ड पर जाएं',
        openDashboard: 'डैशबोर्ड खोलें',
        startFreeToday: 'आज ही मुफ्त शुरू करें',
        alreadyMember: 'क्या आप पहले से सदस्य हैं?',
        featuresTitle: 'स्मार्ट खेती के लिए आपको जो कुछ भी चाहिए',
        featuresSubtitle: 'छोटे किसानों के लिए विशेष रूप से डिजाइन किए गए व्यापक उपकरण',
        // Profile
        manageProfile: 'अपनी खेती प्रोफाइल और उपलब्धियों को प्रबंधित करें',
        saveChanges: 'परिवर्तन सहेजें',
        farmer: 'किसान',
        verifiedAccount: 'सत्यापित खाता',
        totalFarmSize: 'कुल खेत का आकार',
        hectares: 'हेक्टेयर',
        achievements: 'उपलब्धियां',
        noAchievements: 'अभी तक कोई उपलब्धि नहीं। उपलब्धियां अर्जित करने के लिए खेती शुरू करें!',
        yourStats: 'आपके आंकड़े',
        profileCompletion: 'प्रोफाइल पूर्णता',
        profileProgress: 'प्रोफाइल प्रगति',
        addPhotosPrompt: '100% तक पहुंचने के लिए खेत की तस्वीरें जोड़ें',
        quickActions: 'त्वरित कार्रवाई',
        updateProfile: 'खेती प्रोफाइल अपडेट करें',
        changePassword: 'पासवर्ड बदलें',
        privacySettings: 'गोपनीयता सेटिंग्स',
        totalFarms: 'कुल खेत',
        diagnosesMade: 'किए गए निदान',
        waterSaved: 'बचाया गया पानी (लीटर)',
        daysActive: 'सक्रिय दिन',
        earned: 'अर्जित',
        firstDiagnosis: 'पहला निदान',
        firstDiagnosisDesc: 'अपनी पहली फसल स्वास्थ्य जांच पूरी की',
        waterSaver: 'जल रक्षक',
        waterSaverDesc: 'स्मार्ट सिंचाई के माध्यम से महत्वपूर्ण पानी बचाया',
        farmManager: 'खेत प्रबंधक',
        farmManagerDesc: 'सफलतापूर्वक अपना पहला खेत स्थापित किया',
        dedicatedFarmer: 'समर्पित किसान',
        dedicatedFarmerDesc: 'एक महीने से अधिक समय से एग्रीलो का उपयोग कर रहे हैं',

        // Weather Widget
        currentWeather: 'वर्तमान मौसम',
        weatherUnavailable: 'मौसम डेटा अनुपलब्ध',
        gps: 'जीपीएस',
        realDataRequired: 'वास्तविक मौसम डेटा आवश्यक',
        humidity: 'नमी',
        wind: 'हवा',
        uvIndex: 'यूवी इंडेक्स',
        forecast: '3-दिवसीय पूर्वानुमान',
        weatherAlert: 'मौसम चेतावनी',

        // Risk Analysis Widget
        aiRiskAnalysis: 'एआई जोखिम विश्लेषण',
        satelliteDiagnostics: 'वास्तविक समय उपग्रह निदान',
        live: 'लाइव',
        droughtRisk: 'सूखा जोखिम',
        floodRisk: 'बाढ़ जोखिम',
        analysisUnavailable: 'विश्लेषण अनुपलब्ध',
        retryAnalysis: 'विश्लेषण पुनः प्रयास करें',
        analyzingData: 'उपग्रह डेटा का विश्लेषण कर रहा है...',
        basedOnHistory: '20 साल के ऐतिहासिक डेटा पर आधारित',
        updated: 'अपडेट किया गया',
        riskLevels: {
            low: 'कम',
            moderate: 'मध्यम',
            high: 'उच्च',
            poor: 'खराब',
            excellent: 'उत्कृष्ट',
            good: 'अच्छा'
        },

        // Tool Card
        openTool: 'टूल खोलें',
        topRated: 'टॉप रेटेड',
        stats: {
            usage: 'उपयोग',
            accuracy: 'सटीकता',
            success: 'सफलता',
            savings: 'बचत',
            efficiency: 'दक्षता',
            active: 'सक्रिय',
            alerts: 'चेतावनी'
        },

        // Urgent Task Card
        allCaughtUp: 'सब काम पूरे!',
        noUrgentTasks: 'आज के लिए कोई जरूरी काम नहीं',
        greatJob: 'अपने खेत प्रबंधन में शीर्ष पर रहने के लिए बहुत अच्छा काम किया!',
        todaysPriority: 'आज का प्राथमिकता कार्य',
        completeToTrack: 'ट्रैक पर रहने के लिए इसे पूरा करें',
        points: 'अंक',
        completeTask: 'कार्य पूरा करें',
        completing: 'पूरा कर रहा है...',
        completedJob: 'पूरा हुआ! बहुत अच्छा!',
        taskCompletedSuccess: 'कार्य सफलतापूर्वक पूरा हुआ!',

        // AI Doctor
        doctor: {
            title: 'एआई फसल डॉक्टर',
            subtitle: 'एआई-संचालित विश्लेषण के साथ अपने पौधों के लिए तत्काल निदान प्राप्त करें',
            stats: {
                diagnoses: 'निदान',
                accuracy: 'सटीकता',
                rating: 'रेटिंग'
            },
            methods: {
                camera: {
                    title: 'एआई फसल डॉक्टर',
                    subtitle: 'तत्काल फोटो निदान',
                    description: 'त्वरित एआई-संचालित संयंत्र स्वास्थ्य विश्लेषण के लिए एक फोटो लें',
                    features: {
                        realtime: 'वास्तविक समय विश्लेषण',
                        detection: 'रोग का पता लगाना',
                        treatment: 'उपचार सलाह'
                    }
                },
                upload: {
                    title: 'गैलरी अपलोड',
                    subtitle: 'मौजूदा तस्वीरों का विश्लेषण करें',
                    description: 'विश्लेषण के लिए अपनी गैलरी से तस्वीरें अपलोड करें',
                    features: {
                        multiple: 'कई तस्वीरें',
                        batch: 'बैच विश्लेषण',
                        history: 'इतिहास ट्रैकिंग'
                    }
                },
                symptoms: {
                    title: 'लक्षण परीक्षक',
                    subtitle: 'मैनुअल निदान',
                    description: 'व्यक्तिगत सिफारिशों के लिए लक्षणों का वर्णन करें',
                    features: {
                        guide: 'चरण-दर-चरण गाइड',
                        expert: 'विशेषज्ञ ज्ञान',
                        offline: 'ऑफ़लाइन समर्थन'
                    }
                }
            },
            camera: {
                accessDenied: 'कैमरा एक्सेस अस्वीकृत। कृपया कैमरा अनुमतियों की अनुमति दें और पुनः प्रयास करें।',
                perfect: '🌱 उत्तम!',
                guidance: 'पौधे को केंद्र में रखें और अच्छी रोशनी सुनिश्चित करें',
                analyze: 'विश्लेषण करें',
                greatShot: 'बहुत बढ़िया शॉट!'
            },
            analysis: {
                title: 'एआई विश्लेषण प्रगति पर है',
                description: 'हमारा एआई आपकी पौधों की तस्वीरों की सावधानीपूर्वक जांच कर रहा है...',
                complete: 'पूर्ण',
                steps: {
                    uploading: 'छवियां अपलोड की जा रही हैं',
                    processing: 'एआई के साथ प्रसंस्करण',
                    identifying: 'समस्याओं की पहचान करना',
                    generating: 'सिफारिशें उत्पन्न करना'
                }
            },
            results: {
                complete: 'निदान पूरा हुआ!',
                found: "यहाँ हमारे एआई ने क्या पाया",
                plantHealth: 'पौधे का स्वास्थ्य:',
                confidence: 'आत्मविश्वास:',
                treatmentPlan: 'उपचार योजना',
                priority: 'प्राथमिकता',
                newDiagnosis: 'नया निदान',
                saveHistory: 'इतिहास में सहेजें',
                share: 'परिणाम साझा करें',
                unknown: 'अज्ञात'
            },
            symptomChecker: {
                title: 'लक्षण परीक्षक',
                comingSoon: 'जल्द आ रहा है',
                featureComingSoon: 'सुविधा जल्द आ रही है',
                description: "हम आपके लिए एआई-संचालित निदान के साथ एक उन्नत लक्षण परीक्षक लाने के लिए कड़ी मेहनत कर रहे हैं। यह सुविधा आपको चरण-दर-चरण पौधों की समस्याओं की पहचान करने में मदद करेगी।",
                aiPowered: 'एआई-संचालित',
                aiDest: 'सटीक निदान के लिए उन्नत मशीन लर्निंग',
                stepByStep: 'चरण-दर-चरण',
                stepDesc: 'सटीक पहचान के लिए निर्देशित प्रश्न',
                expertAdvice: 'विशेषज्ञ सलाह',
                expertDesc: 'पेशेवर उपचार सिफारिशें',
                back: 'निदान पर वापस जाएं'
            },
            errors: {
                oops: 'उफ़! कुछ गलत हो गया',
                tryAgain: 'पुनः प्रयास करें'
            }
        },

        ctaTitle: 'क्या आप अपनी खेती को बदलने के लिए तैयार हैं?',
        ctaSubtitle: 'आज ही एग्रीलो से जुड़ें और कृषि के भविष्य का अनुभव करें',

        // Login/Register
        signInToAssistant: 'अपने कृषि सहायक में साइन इन करें',
        unexpectedError: 'एक अप्रत्याशित त्रुटि हुई',
        enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
        enterPassword: 'अपना पासवर्ड दर्ज करें',
        dontHaveAccount: 'खाता नहीं है?',
        joinAgrilo: 'एग्रीलो से जुड़ें',
        createAccountTitle: 'अपना कृषि सहायक खाता बनाएं',
        passwordsNoMatch: 'पासवर्ड मेल नहीं खाते',
        registrationFailed: 'पंजीकरण विफल रहा। कृपया पुनः प्रयास करें।',
        personalInfo: 'व्यक्तिगत जानकारी',
        experienceLevel: 'अनुभव स्तर',
        farmingProfileHeader: 'खेती प्रोफाइल',
        farmingType: 'खेती का प्रकार',
        primaryCrops: 'मुख्य फसलें (लागू होने वाले सभी चुनें)',
        // Crops
        maize: 'मक्का',
        rice: 'चावल',
        wheat: 'गेहूं',
        tomatoes: 'टमाटर',
        potatoes: 'आलू',
        beans: 'फलियां',
        cassava: 'कसावा',
        sorghum: 'ज्वार',
        farmSizeHectares: 'खेत का आकार (हेक्टेयर)',
        locationSecurity: 'स्थान और सुरक्षा',
        country: 'देश',
        regionState: 'राज्य/क्षेत्र',
        gettingLocation: 'स्थान प्राप्त कर रहा है...',
        getLocation: 'स्थान प्राप्त करें',
        locationSet: 'स्थान सेट हो गया',
        createAccount: 'खाता बनाएं',
        alreadyHaveAccount: 'क्या आपके पास पहले से एक खाता है?',

        // Dashboard
        loadingDashboard: 'आपका खेत डैशबोर्ड लोड हो रहा है...',
        completeFarmSetup: 'अपना खेत सेटअप पूरा करें',
        setupFarmDesc: 'पूर्ण डैशबोर्ड अनुभव अनलॉक करने के लिए अपना खेत सेटअप करें',
        completeSetup: 'सेटअप पूरा करें',
        dashboardUnavailable: 'डैशबोर्ड अनुपलब्ध',
        dashboardError: 'डैशबोर्ड डेटा लोड करने में असमर्थ। कृपया पेज को रिफ्रेश करें।',
        refreshPage: 'पेज रिफ्रेश करें',
        yourFarm: 'आपका खेत',
        coordinates: 'निर्देशांक',
        aiCropDoctor: 'एआई फसल डॉक्टर',
        instantDiagnosis: 'तत्काल पौधे का निदान',
        snapPhotoDesc: 'तत्काल पौधे के स्वास्थ्य विश्लेषण के लिए एक फोटो लें',
        climateSmartPlanner: 'जलवायु-स्मार्ट योजनाकार',
        perfectTiming: 'हर मौसम में सही समय',
        planCropsDesc: 'मौसम की बुद्धिमत्ता के साथ अपनी फसलों की योजना बनाएं',
        smartIrrigationAdvisor: 'स्मार्ट सिंचाई सलाहकार',
        waterSmarter: 'समझदारी से पानी दें, मेहनत से नहीं',
        optimizeWaterDesc: 'एआई सिफारिशों के साथ पानी के उपयोग को अनुकूलित करें',
        interactiveFarmMap: 'इंटरैक्टिव खेत मानचित्र',
        visualizeFields: 'अपने खेतों की कल्पना करें',
        trackFarmStatusDesc: 'खेत की स्थिति को ट्रैक करें और नक्शे पर समस्याओं की रिपोर्ट करें',
        farmingToolkit: 'आपका खेती टूलकिट',
        chooseAction: 'अपनी अगली कार्रवाई चुनें',
        cropGrowthProgress: 'फसल विकास प्रगति',
        stage: 'चरण',
        grown: 'विकसित',
        daysToHarvest: 'कटाई के लिए दिन',
        analytics: 'एनालिटिक्स',
        learning: 'सीखना',
        support: 'समर्थन',

        // Irrigation Planning
        // Irrigation Planning
        irrigationPage: {
            title: 'स्मार्ट सिंचाई सलाहकार',
            subtitle: 'इष्टतम फसल स्वास्थ्य के लिए एआई-संचालित सिंचाई सिफारिशें',
            loadingFarms: 'खेत लोड हो रहे हैं...',
            noFarms: 'कोई खेत उपलब्ध नहीं',
            noFarmsDesc: "आपने अभी तक कोई खेत सेट नहीं किया है। सिंचाई सिफारिशें प्राप्त करने के लिए पहले एक खेत बनाएं।",
            goToFarm: 'खेत प्रबंधन पर जाएं',
            checkStatus: 'सिंचाई स्थिति की जांच करें',
            backToFarms: '← खेतों पर वापस जाएं',
            limitedData: 'सीमित डेटा उपलब्ध',
            dataReliability: 'डेटा विश्वसनीयता',
            unknown: 'अज्ञात',
            status: {
                urgent: 'तत्काल सिंचाई',
                needed: 'सिंचाई की आवश्यकता',
                skip: 'सिंचाई छोड़ें',
                optimal: 'इष्टतम नमी',
                monitor: 'स्थिति की निगरानी करें'
            },
            recommended: 'सिफारिश की गई',
            optimalTimes: 'इष्टतम सिंचाई समय',
            avoidTimes: 'इन समयों से बचें',
            conservationTips: 'जल संरक्षण सुझाव',
            impact: 'पर्यावरण प्रभाव',
            cost: 'लागत अनुमान',
            soilMoisture: 'मिट्टी की नमी का विश्लेषण',
            current: 'वर्तमान',
            capacity: 'क्षमता',
            evapo: 'वाष्पीकरण डेटा',
            soilProps: 'मिट्टी के गुण',
            weather: 'वर्तमान मौसम',
            airQuality: 'वायु गुणवत्ता',
            unavailable: 'सिंचाई डेटा अनुपलब्ध',
            unavailableDesc: 'इस स्थान के लिए अपर्याप्त वास्तविक डेटा के कारण सिंचाई सिफारिशें प्रदान करने में असमर्थ।',
            requirements: 'डेटा आवश्यकताएं'
        },

        // Crop Planning
        // Crop Planning
        planningPage: {
            title: 'जलवायु-स्मार्ट योजनाकार',
            subtitle: 'बदलती जलवायु परिस्थितियों के लिए एआई-संचालित फसल सिफारिशें',
            getRecs: 'सिफारिशें प्राप्त करें',
            preferences: 'हमें अपनी प्राथमिकताओं के बारे में बताएं',
            prefSubtitle: 'यह हमें बेहतर फसल सिफारिशें प्रदान करने में मदद करता है',
            experience: 'अनुभव स्तर',
            budget: 'बजट सीमा',
            market: 'बाजार पहुंच',
            risk: 'जोखिम सहनशीलता',
            getRecsBtn: 'सिफारिशें प्राप्त करें →',
            adjustPref: '← प्राथमिकताएं समायोजित करें',
            recsFor: 'के लिए फसल सिफारिशें',
            recsSubtitle: 'आपकी प्राथमिकताओं पर आधारित जलवायु-स्मार्ट सुझाव',
            topRecs: 'शीर्ष 3 सिफारिशें',
            seasonalCalendar: 'मौसमी रोपण कैलेंडर',
            months: 'महीने',
            climateAdaptation: 'जलवायु अनुकूलन रणनीतियाँ',
            strategies: 'रणनीतियाँ',
            affectedCrops: 'प्रभावित फसलें',
            viewDetails: 'विवरण देखें',
            quickPreview: 'त्वरित पूर्वावलोकन',
            basicInfo: 'मूलभूत जानकारी',
            economicAnalysis: 'आर्थिक विश्लेषण',
            waterRequirements: 'जल आवश्यकताएं',
            plantingSchedule: 'रोपण अनुसूची',
            benefits: 'लाभ',
            challenges: 'चुनौतियां',
            riskFactors: 'जोखिम कारक',
            keyFeatures: 'मुख्य विशेषताएं'
        },

        // Farm Map
        // Farm Map
        farmMapPage: {
            myFarms: 'मेरे खेत',
            loading: 'खेत लोड हो रहे हैं...',
            noFarms: 'अभी तक कोई खेत नहीं जोड़ा गया।',
            nearbyAlerts: 'आस-पास की चेतावनियां',
            noAlerts: 'आस-पास कोई समस्या रिपोर्ट नहीं की गई।',
            reportIssue: 'समस्या रिपोर्ट करें',
            issueType: 'समस्या का प्रकार',
            severity: 'गंभीरता',
            description: 'विवरण',
            submit: 'रिपोर्ट जमा करें',
            cancel: 'रद्द करें',
            success: 'समस्या सफलतापूर्व रिपोर्ट की गई!',
            failed: 'समस्या रिपोर्ट करने में विफल।',
            deleteConfirm: 'क्या आप सुनिश्चित हैं कि आप इस समस्या को हटाना चाहते हैं?',
            types: {
                pest: 'कीट संक्रमण',
                disease: 'फसल रोग',
                fire: 'आग का खतरा',
                flood: 'बाढ़ का जोखिम',
                drought: 'गंभीर सूखा',
                other: 'अन्य'
            },
            severities: {
                low: 'कम - निगरानी',
                medium: 'मध्यम - कार्रवाई आवश्यक',
                high: 'उच्च - तत्काल',
                critical: 'गंभीर - तत्काल खतरा'
            }
        }
    }
}
