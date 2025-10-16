const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    mainTopic: {
        type: String,
        required: true,
        enum: ['부동산', '금리', '한국경제'],
        default: '부동산'
    },
    subTopic: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        trim: true
    },
    source: {
        type: String,
        required: true,
        trim: true
    },
    publishedAt: {
        type: Date,
        required: true
    },
    originalTitle: {
        type: String,
        trim: true
    },
    keywords: [{
        type: String,
        trim: true
    }],
    impact: {
        type: String,
        enum: ['높음', '보통', '낮음'],
        default: '보통'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 인덱스 설정
newsSchema.index({ mainTopic: 1, createdAt: -1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ isActive: 1, createdAt: -1 });

// 가상 필드: 요약된 제목 (50자 제한)
newsSchema.virtual('shortTitle').get(function() {
    return this.title.length > 50 ? this.title.substring(0, 50) + '...' : this.title;
});

// 가상 필드: 요약된 내용 (200자 제한)
newsSchema.virtual('shortSummary').get(function() {
    return this.summary.length > 200 ? this.summary.substring(0, 200) + '...' : this.summary;
});

// 정적 메서드: 최신 뉴스 조회 (최대 15개)
newsSchema.statics.getLatestNews = function() {
    return this.find({ 
        isActive: true 
    })
    .sort({ publishedAt: -1 })
    .limit(15);
};

// 정적 메서드: 주제별 뉴스 조회
newsSchema.statics.getNewsByMainTopic = function(mainTopic) {
    return this.find({ 
        mainTopic: mainTopic,
        isActive: true 
    })
    .sort({ publishedAt: -1 })
    .limit(15);
};

// 정적 메서드: 오늘의 뉴스 조회
newsSchema.statics.getTodayNews = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.find({ 
        createdAt: { $gte: today },
        isActive: true 
    })
    .sort({ publishedAt: -1 })
    .limit(15);
};

module.exports = mongoose.model('News', newsSchema);
