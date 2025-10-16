const Post = require('../models/Post.model');
const User = require('../models/user.model');

// 게시글 생성
const createPost = async (req, res) => {
    try {
        const { title, content, category, subCategory, tags, url } = req.body;
        const authorId = req.user.id;
        
        // 작성자 정보 가져오기
        const author = await User.findById(authorId);
        if (!author) {
            return res.status(404).json({ message: '작성자를 찾을 수 없습니다.' });
        }

        const postData = {
            title,
            content,
            category,
            subCategory,
            author: authorId,
            authorName: author.name || author.email,
            tags: tags || [],
            url: url || null
        };

        const post = new Post(postData);
        await post.save();

        res.status(201).json({
            message: '게시글이 성공적으로 생성되었습니다.',
            post: await Post.findById(post._id).populate('author', 'name email')
        });
    } catch (error) {
        console.error('게시글 생성 오류:', error);
        res.status(500).json({ message: '게시글 생성 중 오류가 발생했습니다.', error: error.message });
    }
};

// 게시글 목록 조회
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, status, author } = req.query;
        const skip = (page - 1) * limit;

        let query = { isActive: true };
        
        if (category) query.category = category;
        if (status) query.status = status;
        if (author) query.author = author;

        console.log('게시글 조회 쿼리:', query);

        const posts = await Post.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Post.countDocuments(query);

        console.log(`총 ${total}개 게시글 중 ${posts.length}개 조회됨`);

        res.json({
            posts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('게시글 목록 조회 오류:', error);
        res.status(500).json({ message: '게시글 목록 조회 중 오류가 발생했습니다.', error: error.message });
    }
};

// 게시글 상세 조회
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id)
            .populate('author', 'name email');
        
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 조회수 증가
        await post.incrementViews();

        res.json(post);
    } catch (error) {
        console.error('게시글 상세 조회 오류:', error);
        res.status(500).json({ message: '게시글 상세 조회 중 오류가 발생했습니다.', error: error.message });
    }
};

// 게시글 수정
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, subCategory, tags, url } = req.body;
        const authorId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 작성자 확인
        if (post.author.toString() !== authorId) {
            return res.status(403).json({ message: '게시글을 수정할 권한이 없습니다.' });
        }

        const updateData = {
            title,
            content,
            category,
            subCategory,
            tags: tags || [],
            url: url || null
        };

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'name email');

        res.json({
            message: '게시글이 성공적으로 수정되었습니다.',
            post: updatedPost
        });
    } catch (error) {
        console.error('게시글 수정 오류:', error);
        res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.', error: error.message });
    }
};

// 게시글 삭제
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 작성자 확인
        if (post.author.toString() !== authorId) {
            return res.status(403).json({ message: '게시글을 삭제할 권한이 없습니다.' });
        }

        await Post.findByIdAndUpdate(id, { isActive: false });

        res.json({ message: '게시글이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.', error: error.message });
    }
};

// 게시글 발행
const publishPost = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 작성자 확인
        if (post.author.toString() !== authorId) {
            return res.status(403).json({ message: '게시글을 발행할 권한이 없습니다.' });
        }

        await post.publish();

        res.json({
            message: '게시글이 성공적으로 발행되었습니다.',
            post: await Post.findById(id).populate('author', 'name email')
        });
    } catch (error) {
        console.error('게시글 발행 오류:', error);
        res.status(500).json({ message: '게시글 발행 중 오류가 발생했습니다.', error: error.message });
    }
};

// 게시글 아카이브
const archivePost = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        // 작성자 확인
        if (post.author.toString() !== authorId) {
            return res.status(403).json({ message: '게시글을 아카이브할 권한이 없습니다.' });
        }

        await post.archive();

        res.json({ message: '게시글이 성공적으로 아카이브되었습니다.' });
    } catch (error) {
        console.error('게시글 아카이브 오류:', error);
        res.status(500).json({ message: '게시글 아카이브 중 오류가 발생했습니다.', error: error.message });
    }
};

// 내 게시글 조회
const getMyPosts = async (req, res) => {
    try {
        const authorId = req.user.id;
        const { page = 1, limit = 20, status } = req.query;
        const skip = (page - 1) * limit;

        let query = { author: authorId, isActive: true };
        if (status) query.status = status;

        const posts = await Post.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('내 게시글 조회 오류:', error);
        res.status(500).json({ message: '내 게시글 조회 중 오류가 발생했습니다.', error: error.message });
    }
};

// 카테고리별 게시글 조회
const getPostsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.getPostsByCategory(category, parseInt(limit), skip);
        const total = await Post.countDocuments({ 
            category, 
            status: 'published', 
            isActive: true 
        });

        res.json({
            posts,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('카테고리별 게시글 조회 오류:', error);
        res.status(500).json({ message: '카테고리별 게시글 조회 중 오류가 발생했습니다.', error: error.message });
    }
};

// 최신 게시글 조회
const getRecentPosts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const posts = await Post.getRecentPosts(parseInt(limit));
        
        res.json({ posts });
    } catch (error) {
        console.error('최신 게시글 조회 오류:', error);
        res.status(500).json({ message: '최신 게시글 조회 중 오류가 발생했습니다.', error: error.message });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    publishPost,
    archivePost,
    getMyPosts,
    getPostsByCategory,
    getRecentPosts
};
