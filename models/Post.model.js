const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['부동산', '금리', '한국경제'],
        default: '부동산'
    },
    subCategory: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    url: {
        type: String,
        trim: true
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 가상 필드
postSchema.virtual('excerpt').get(function() {
    return this.content.length > 150 ? this.content.substring(0, 150) + '...' : this.content;
});

postSchema.virtual('readTime').get(function() {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
});

// 인덱스
postSchema.index({ category: 1, status: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ isActive: 1, status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// 정적 메서드
postSchema.statics.getPublishedPosts = function(limit = 20, skip = 0) {
    return this.find({ 
        status: 'published', 
        isActive: true 
    })
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .skip(skip);
};

postSchema.statics.getPostsByCategory = function(category, limit = 20, skip = 0) {
    return this.find({ 
        category: category,
        status: 'published', 
        isActive: true 
    })
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .limit(limit)
    .skip(skip);
};

postSchema.statics.getRecentPosts = function(limit = 10) {
    return this.find({ 
        status: 'published', 
        isActive: true 
    })
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .limit(limit);
};

postSchema.statics.getDraftPosts = function(authorId) {
    return this.find({ 
        author: authorId,
        status: 'draft',
        isActive: true 
    })
    .sort({ updatedAt: -1 });
};

// 인스턴스 메서드
postSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

postSchema.methods.toggleLike = function() {
    this.likes += 1;
    return this.save();
};

postSchema.methods.publish = function() {
    this.status = 'published';
    this.publishedAt = new Date();
    return this.save();
};

postSchema.methods.archive = function() {
    this.status = 'archived';
    this.isActive = false;
    return this.save();
};

module.exports = mongoose.model('Post', postSchema);
