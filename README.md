# Phuong Tung Thien Mini App

Zalo Mini App phuc vu nguoi dan Phuong Tung Thien voi cac nhom chuc nang chinh:

- Tra cuu va gui phan anh, kien nghi
- Dat lich tiep dan
- Xem tin tuc, su kien va di tich
- Mo nhanh cac cong dich vu cong lien quan

## Cau truc du an

- `src/`: frontend Zalo Mini App
- `backend/`: API, xac thuc Zalo, quan tri va nghiep vu
- `admin/`: giao dien quan tri

## Chay frontend

```bash
npm install
npm run dev
```

Frontend mac dinh goi API theo `VITE_API_URL`. Neu khong cau hinh, ung dung dung `http://localhost:3001`.

## Chay backend

```bash
cd backend
npm install
npm run dev
```

## Luu y phat trien

- Luong dang nhap uu tien `getAccessToken()` tu Zalo Mini App, co fallback `dev-login` khi chay local neu bat dev auth.
- Cac trang web ngoai nhu DVC, VNeID, iHanoi, TTDT duoc mo bang `openWebview` va co fallback cho moi truong web dev.
- Du an dang trong giai doan phat trien nen mot so yeu cau chi danh cho production chua duoc ap dung o day.

## GitHub Actions CI/CD

- CI nam o `.github/workflows/ci.yml`, tu dong build `frontend`, `admin` va `backend` khi push hoac tao pull request.
- CI hien kiem tra them `TypeScript` cho frontend va `Prisma schema` cho backend de bat loi som hon truoc khi deploy.
- CD nam o `.github/workflows/deploy.yml`, tu dong deploy khi push len nhanh `main` hoac chay tay bang `workflow_dispatch`.
- Workflow deploy hien tai dung SSH + `rsync`, phu hop khi frontend/admin duoc copy len web server va backend duoc restart bang `pm2`.
- Neu chua co VPS hoac may chu dich, co the bat CI truoc va de CD o trang thai chuan bi.

Can tao cac GitHub Secrets sau neu muon bat CD:

- `SSH_HOST`: IP hoac domain cua server
- `SSH_USER`: tai khoan SSH tren server
- `SSH_PRIVATE_KEY`: private key dung de deploy
- `DEPLOY_FRONTEND_DIR`: thu muc nhan file build tu `www/`
- `DEPLOY_ADMIN_DIR`: thu muc nhan file build tu `admin/dist/`
- `DEPLOY_BACKEND_DIR`: thu muc chua backend production

Luu y backend deploy gia dinh rang:

- Server da cai `node`, `npm`, `pm2`
- File `.env` production da ton tai san trong `DEPLOY_BACKEND_DIR`
- Database production duoc phep chay `npx prisma migrate deploy`
