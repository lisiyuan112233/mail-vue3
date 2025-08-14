import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 递归获取目录下所有 Vue 文件
function getAllVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllVueFiles(filePath, fileList);
    } else if (path.extname(file) === '.vue') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 转换 Vue 文件为 Vue3 组合式 API
function convertToVue3(filePath) {
  console.log(`正在转换: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否已经使用了 setup 语法
    if (content.includes('<script setup>')) {
      console.log(`  已经是 Vue3 组合式 API: ${filePath}`);
      return;
    }
    
    // 1. 替换模板中的 slot-scope 为 #default
    content = content.replace(/slot-scope="(\w+)"/g, '#default="$1"');
    
    // 2. 替换 :visible.sync 为 v-model
    content = content.replace(/:visible\.sync/g, 'v-model');
    
    // 3. 替换 <script> 部分
    content = content.replace(/<script>[\s\S]*?<\/script>/, (match) => {
      // 提取导入语句
      const importMatches = match.match(/import\s+.+\s+from\s+['"].+['"];?/g) || [];
      
      // 提取组件名称
      const nameMatch = match.match(/name:\s*['"]([^'"]+)['"]/);
      const componentName = nameMatch ? nameMatch[1] : '';
      
      // 构建新的 script setup
      let newScript = '<script setup>\n';
      
      // 添加导入语句
      importMatches.forEach(importStr => {
        newScript += importStr + '\n';
      });
      
      // 添加基本的 Vue 组合式 API 导入
      newScript += 'import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from \'vue\';\n';
      newScript += 'import { getCurrentInstance } from \'vue\';\n\n';
      
      // 添加 getCurrentInstance
      newScript += 'const { proxy } = getCurrentInstance();\n\n';
      
      // 添加基本的 defineEmits
      newScript += 'const emit = defineEmits([]);\n\n';
      
      // 添加注释提示
      newScript += '// TODO: 请手动完成以下转换工作：\n';
      newScript += '// 1. 将 data() 中的属性转换为 ref 或 reactive\n';
      newScript += '// 2. 将 methods 中的方法转换为普通函数\n';
      newScript += '// 3. 将 computed 属性转换为 computed() 函数\n';
      newScript += '// 4. 将 watch 转换为 watch() 函数\n';
      newScript += '// 5. 将生命周期钩子转换为对应的组合式 API 函数\n';
      newScript += '// 6. 使用 defineProps 定义组件属性\n';
      newScript += '// 7. 使用 defineExpose 暴露需要给父组件的方法\n\n';
      
      newScript += '</script>';
      
      return newScript;
    });
    
    // 写入文件
    fs.writeFileSync(filePath + '.vue3', content);
    console.log(`  转换完成: ${filePath}.vue3 (请检查并完成剩余转换工作)`);
    
  } catch (error) {
    console.error(`  转换失败: ${filePath}`, error);
  }
}

// 主函数
function main() {
  const modulesDir = path.join(__dirname, 'src', 'views', 'modules');
  const vueFiles = getAllVueFiles(modulesDir);
  
  console.log(`找到 ${vueFiles.length} 个 Vue 文件需要转换`);
  
  vueFiles.forEach(file => {
    convertToVue3(file);
  });
  
  console.log('转换完成！生成的 .vue3 文件需要手动检查和完善');
}

main();