# noodles-sql-design-electron
用electron打包到了win64位机和macOS，不再使用原项目的webpack，但仍然保留配置。
数据库从mysql迁移到了sqlite3，通信方式不变。

收获：
1. 数据库和前后端通信是独立的，更换数据库不影响前后端通信，只要保持数据库的结构和定义的字段不变即可。
2. npm可以交叉编译，默认编译到本机的操作系统。
3. electron打包很容易，本项目把服务器端一起打包进来（不合理），在入口文件需要用子进程唤起服务端。注意cmd和shell的指令格式是不同的。
4. 服务器端是子进程，node.js方式编写，新起文件夹了，也需要package.json和node_modules，否则无法运行。
5. 只使用js实现的包，无需考虑跨平台的问题。（sqlite3打包时，打包到其他平台需要npm的交叉编译，但是最终没有使用better-sqlite3，不想再改代码了，，，）

注意：
本项目只能使用npm，yarn和pnpm安装依赖都会出现bug。
