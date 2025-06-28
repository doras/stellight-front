const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const customParams = require('./params');
const routes = require('./routes.json');

const rewriter = jsonServer.rewriter(routes);

server.use(middlewares);
server.use(rewriter);         // ✅ 커스텀 라우팅 적용
server.use(customParams);     // ✅ 요청 미들웨어 적용

// ✅ 응답 커스터마이징 (Spring Page 스타일)
router.render = (req, res) => {
    const isScheduleRequest = req.path.startsWith('/schedules');

    if (!isScheduleRequest) {
        res.json(res.locals.data);
        return;
    }

    const total = res.getHeader('X-Total-Count');

    if (total !== undefined && Array.isArray(res.locals.data)) {
        const fullUrl = new URL(req.originalUrl, `http://${req.headers.host}`);
        const searchParams = fullUrl.searchParams;

        const page = parseInt(searchParams.get('page') || '0');
        const size = parseInt(searchParams.get('size') || '10');
        const totalElements = parseInt(total, 10);
        const totalPages = Math.ceil(totalElements / size);

        return res.json({
            content: res.locals.data,
            totalElements,
            totalPages,
            size,
            number: page,
            numberOfElements: res.locals.data.length,
            first: page === 0,
            last: totalPages === 0 || page === totalPages - 1,
            empty: res.locals.data.length === 0
        });
    }

    res.json(res.locals.data);
};

server.use(router);

server.listen(3001, () => {
    console.log('✅ JSON Server running on http://localhost:3001');
});
