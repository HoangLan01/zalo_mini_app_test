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
