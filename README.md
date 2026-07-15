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

Frontend local co the goi `http://localhost:3001` neu khong truyen `VITE_API_URL`.
Production build bat buoc phai truyen ro `VITE_API_URL` va `VITE_ZALO_OA_ID`, neu thieu build se fail som.

## Chay backend

```bash
cd backend
npm install
npm run dev
```

## Luu y phat trien

- Luong dang nhap uu tien `getAccessToken()` tu Zalo Mini App, co fallback `dev-login` chi khi chay local va chu dong bat dev auth.
- Cac trang web ngoai nhu DVC, VNeID, iHanoi, TTDT duoc mo bang `openWebview` va co fallback cho moi truong web dev.

## Env va topology production

- Topology da chot:
  - `frontend`: public app origin tren domain `phuongtungthien.com`
  - `admin`: `https://admin.phuongtungthien.com`
  - `backend`: `https://api.phuongtungthien.com`
- Frontend va admin production deu phai build voi `VITE_API_URL=https://api.phuongtungthien.com`.
- Backend production can khai bao toi thieu:
  - `APP_URL=https://phuongtungthien.com`
  - `ADMIN_APP_URL=https://admin.phuongtungthien.com`
  - `COOKIE_DOMAIN=api.phuongtungthien.com`
  - `ADMIN_COOKIE_SAME_SITE=strict` hoac gia tri da duoc kiem thu theo flow thuc te
- `ENABLE_DEV_AUTH` va `VITE_ENABLE_DEV_AUTH` phai de `false` trong moi truong public.

## Bao mat secret

- Khong dua secret that vao `.env.example`, `backend/.env.example`, `admin/.env.example`.
- Neu secret da tung xuat hien trong repo hoac file mau, can rotate tren he thong that truoc khi deploy production.
- Nhom can uu tien rotate: `JWT_SECRET`, thong tin bootstrap admin, secret/token Zalo, secret Cloudinary va bat ky key nao tung duoc commit.

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
