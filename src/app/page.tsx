import { redirect } from "next/navigation";

export default function Home() {
  // Chuyển hướng người dùng vào trang Dashboard (nếu chưa đăng nhập, Next.js Middleware hoặc logic bên trong Dashboard sẽ đẩy ra Login)
  redirect("/dashboard");
}
