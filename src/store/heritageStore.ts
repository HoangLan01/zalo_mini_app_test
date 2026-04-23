import { create } from 'zustand';

export type HeritageItem = {
  id: string;
  name: string;
  address: string;
  coverImage: string;
  shortDesc: string;
  description: string;
  gallery: string[];
};

interface HeritageState {
  heritages: HeritageItem[];
  getHeritageById: (id: string) => HeritageItem | undefined;
}

const mockHtmlContent = `
  <p><strong>ĐÌNH THANH VỊ - VIÊN NGỌC QUÝ GIỮA LÒNG XỨ ĐOÀI</strong></p>
  <br/>
  <p>Đình Thanh Vị tọa lạc tại tổ dân phố Thanh Vị, phường Tùng Thiện, thành phố Hà Nội. Theo các tư liệu Hán Nôm còn ghi chép lại, làng Thanh Vị vào thời Lê Trung Hưng thuộc huyện Minh Nghĩa, phủ Quảng Oai, xứ Sơn Tây; đến thời Nguyễn, làng Thanh Vị thuộc huyện Tùng Thiện, phủ Quảng Oai, tỉnh Sơn Tây.</p>
  <br/>
  <p>Tản Viên Sơn Thánh là vị Thành hoàng được thờ phụng tại đình làng Thanh Vị, Ngài thuộc nhóm Tứ bất tử trong tín ngưỡng dân gian Việt Nam, có vai trò quan trọng trong đời sống văn hóa và tâm linh của cư dân địa phương. Theo thần phả, Tản Viên Sơn Thánh tên húy là Nguyễn Tuấn sinh vào thời Hùng Vương thứ mười tám; quê ở động Lăng Xương, huyện Thanh Nguyên, phủ Gia Hưng.</p>
  <br/>
  <p>Những dấu tích còn lại cho thấy đình Thanh Vị được khởi dựng vào năm Cảnh Hưng thứ 4 (1743), cho đến nay đình đã được tu sửa nhiều lần, đặc biệt có đợt trùng tu lớn vào thời Nguyễn, cụ thể là vào năm 1900 dưới thời vua Thành Thái.</p>
  <br/>
  <p>Về vị trí, đình Thanh Vị được xây dựng theo hướng Đông Nam, tọa lạc trên một sườn đồi rộng, cách trục đường tỉnh lộ 87A khoảng 700m. Theo quan niệm phong thủy truyền thống, đây là nơi hội tụ phúc khí, biểu trưng cho sự che chở, bền vững, linh thiêng.</p>
  <br/>
  <p>Về kiến trúc, đình Thanh Vị trước đây là một quần thể kiến trúc gồm nhiều hạng mục công trình như Nghi môn, Giải vũ, Tiền tế, Đại bái… Tuy nhiên, do tác động của thiên nhiên và chiến tranh, đến nay di tích chỉ còn lại tòa Đại bái được xây dựng với quy mô từ thời Lê Trung Hưng.</p>
  <br/>
  <p>Hậu cung đình Thanh Vị nối liền với tòa Đại bái gồm 3 gian với ba phía được xây kín. Bên ngoài được làm hệ thống cửa bức bàn và bưng kín. Các bộ vì bên trong được làm theo kiểu thức chồng rường, bẩy; hạ kẻ tạo thành hai tầng mái với các góc đao cong.</p>
  <br/>
  <p>Đình làng Thanh Vị đã được Bộ Văn hóa thông tin công nhận là di tích kiến trúc nghệ thuật năm 1999.</p>
`;

const initialHeritages: HeritageItem[] = [
  { 
    id: '1', 
    name: 'Đình Thanh Vị', 
    address: 'Tổ dân phố Thanh Vị, Phường Tùng Thiện, TP Hà Nội', 
    coverImage: 'https://images.unsplash.com/photo-1590076215667-874d4efda702?w=800',
    shortDesc: 'Đình Thanh Vị tọa lạc tại tổ dân phố Thanh Vị, thờ phụng Tản Viên Sơn Thánh, được khởi dựng vào năm 1743...',
    description: mockHtmlContent,
    gallery: [
      'https://images.unsplash.com/photo-1551041777-ed277b8dd348?w=500',
      'https://images.unsplash.com/photo-1582200371383-74b0f9dc8e75?w=500',
      'https://images.unsplash.com/photo-1543304526-72dd3780c74b?w=500'
    ]
  },
  { 
    id: '2', 
    name: 'Đền Mẫu Phường Tùng Thiện', 
    address: 'Khu dân cư số 2, Phường Tùng Thiện', 
    coverImage: 'https://images.unsplash.com/photo-1565552395627-142277d3f233?w=800',
    shortDesc: 'Đền thờ Mẫu mang đậm kiến trúc nghệ thuật thời Nguyễn, lưu giữ nhiều sắc phong cổ.',
    description: '<p>Nội dung chi tiết đang được Admin cập nhật...</p>',
    gallery: []
  }
];

export const useHeritageStore = create<HeritageState>((set, get) => ({
  heritages: initialHeritages,
  getHeritageById: (id) => get().heritages.find(h => h.id === id)
}));
