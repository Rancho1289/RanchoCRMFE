const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
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
} = require('../controllers/Post.controller');

// 게시글 생성 (인증 필요)
router.post('/', auth, createPost);

// 게시글 목록 조회 (공개)
router.get('/', getPosts);

// 최신 게시글 조회 (공개)
router.get('/recent', getRecentPosts);

// 카테고리별 게시글 조회 (공개)
router.get('/category/:category', getPostsByCategory);

// 게시글 상세 조회 (공개)
router.get('/:id', getPostById);

// 내 게시글 조회 (인증 필요)
router.get('/my/posts', auth, getMyPosts);

// 게시글 수정 (인증 필요)
router.put('/:id', auth, updatePost);

// 게시글 삭제 (인증 필요)
router.delete('/:id', auth, deletePost);

// 게시글 발행 (인증 필요)
router.patch('/:id/publish', auth, publishPost);

// 게시글 아카이브 (인증 필요)
router.patch('/:id/archive', auth, archivePost);

module.exports = router;
