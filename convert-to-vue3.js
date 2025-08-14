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
    
    // 提取 template 部分
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
    let template = templateMatch ? templateMatch[0] : '<template></template>';
    
    // 修改 slot-scope 为 #default
    template = template.replace(/slot-scope="(\w+)"/g, '#default="$1"');
    
    // 修改 :visible.sync 为 v-model
    template = template.replace(/:visible\.sync/g, 'v-model');
    
    // 提取 script 部分
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      console.log(`  无法找到 script 标签: ${filePath}`);
      return;
    }
    
    const scriptContent = scriptMatch[1];
    
    // 提取 style 部分
    const styleMatch = content.match(/<style[\s\S]*?>([\s\S]*?)<\/style>/);
    const style = styleMatch ? styleMatch[0] : '<style scoped>\n</style>';
    
    // 提取导入语句
    const importMatches = scriptContent.match(/import\s+.+\s+from\s+['"].+['"];?/g) || [];
    const importComponents = [];
    importMatches.forEach(importStr => {
      const componentMatch = importStr.match(/import\s+(\w+)\s+from/);
      if (componentMatch) {
        importComponents.push(componentMatch[1]);
      }
    });
    
    // 提取组件名称
    const nameMatch = scriptContent.match(/name:\s*['"]([^'"]+)['"]/);
    const componentName = nameMatch ? nameMatch[1] : '';
    
    // 提取 props
    const propsMatch = scriptContent.match(/props:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const propsStr = propsMatch ? propsMatch[1].trim() : '';
    
    // 提取 data
    const dataMatch = scriptContent.match(/data\s*\(\)\s*{[^{]*return\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)};?\s*}/);
    const dataStr = dataMatch ? dataMatch[1].trim() : '';
    
    // 提取 computed
    const computedMatch = scriptContent.match(/computed:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const computedStr = computedMatch ? computedMatch[1].trim() : '';
    
    // 提取 watch
    const watchMatch = scriptContent.match(/watch:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const watchStr = watchMatch ? watchMatch[1].trim() : '';
    
    // 提取 methods
    const methodsMatch = scriptContent.match(/methods:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const methodsStr = methodsMatch ? methodsMatch[1].trim() : '';
    
    // 提取生命周期钩子
    const createdMatch = scriptContent.match(/created\s*\(\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const createdStr = createdMatch ? createdMatch[1].trim() : '';
    
    const mountedMatch = scriptContent.match(/mounted\s*\(\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const mountedStr = mountedMatch ? mountedMatch[1].trim() : '';
    
    const beforeDestroyMatch = scriptContent.match(/beforeDestroy\s*\(\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}(?=,|\s*})/);
    const beforeDestroyStr = beforeDestroyMatch ? beforeDestroyMatch[1].trim() : '';
    
    // 提取 emits
    const emitsMatch = scriptContent.match(/\$emit\(['"]([^'"]+)['"]/g);
    const emits = new Set();
    if (emitsMatch) {
      emitsMatch.forEach(emit => {
        const emitName = emit.match(/\$emit\(['"]([^'"]+)['"]/)[1];
        emits.add(emitName);
      });
    }
    
    // 构建新的 script setup 内容
    let newScriptContent = '<script setup>\n';
    
    // 添加导入语句
    importMatches.forEach(importStr => {
      newScriptContent += importStr + '\n';
    });
    
    // 添加 Vue 组合式 API 导入
    const imports = ['ref', 'reactive'];
    if (computedStr) imports.push('computed');
    if (watchStr) imports.push('watch');
    if (createdStr || mountedStr) imports.push('onMounted');
    if (beforeDestroyStr) imports.push('onBeforeUnmount');
    
    newScriptContent += `import { ${imports.join(', ')} } from 'vue';\n`;
    newScriptContent += 'import { getCurrentInstance } from \'vue\';\n\n';
    
    // 添加 getCurrentInstance
    newScriptContent += 'const { proxy } = getCurrentInstance();\n\n';
    
    // 处理 props
    if (propsStr) {
      newScriptContent += 'const props = defineProps({\n';
      newScriptContent += propsStr + '\n';
      newScriptContent += '});\n\n';
    }
    
    // 添加 emits
    if (emits.size > 0) {
      newScriptContent += `const emit = defineEmits(['${Array.from(emits).join('\', \'')}']);\n\n`;
    } else {
      newScriptContent += 'const emit = defineEmits([]);\n\n';
    }
    
    // 处理 data
    if (dataStr) {
      const dataLines = dataStr.split(',\n').map(line => line.trim()).filter(line => line);
      
      for (const line of dataLines) {
        try {
          const colonIndex = line.indexOf(':');
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // 处理尾部逗号
            if (value.endsWith(',')) {
              value = value.slice(0, -1);
            }
            
            if (value.startsWith('{') || value.startsWith('[')) {
              newScriptContent += `const ${key} = reactive(${value});\n`;
            } else {
              newScriptContent += `const ${key} = ref(${value});\n`;
            }
          }
        } catch (error) {
          console.error(`  处理 data 属性出错: ${line}`, error);
        }
      }
      newScriptContent += '\n';
    }
    
    // 处理 computed
    if (computedStr) {
      const computedProps = computedStr.split(/},\s*/).map(prop => {
        const match = prop.match(/(\w+)\s*\(\)\s*{([\s\S]*)$/);
        if (match) {
          const propName = match[1];
          let propBody = match[2].trim();
          if (propBody.endsWith('}')) {
            propBody = propBody.slice(0, -1);
          }
          return { name: propName, body: propBody };
        }
        return null;
      }).filter(Boolean);
      
      computedProps.forEach(prop => {
        newScriptContent += `const ${prop.name} = computed(() => {\n${prop.body}\n});\n\n`;
      });
    }
    
    // 处理 watch
    if (watchStr) {
      const watchProps = watchStr.split(/},\s*/).map(prop => {
        const match = prop.match(/(\w+)\s*\(([\s\S]*?)\)\s*{([\s\S]*)$/);
        if (match) {
          const propName = match[1];
          const params = match[2].trim();
          let propBody = match[3].trim();
          if (propBody.endsWith('}')) {
            propBody = propBody.slice(0, -1);
          }
          return { name: propName, params, body: propBody };
        }
        return null;
      }).filter(Boolean);
      
      watchProps.forEach(prop => {
        newScriptContent += `watch(${prop.name}, (${prop.params}) => {\n${prop.body}\n});\n\n`;
      });
    }
    
    // 处理 methods
    if (methodsStr) {
      const methodRegex = /(\w+)\s*\(([^)]*)\)\s*{([\s\S]*?)(?=\n\s*\w+\s*\([^)]*\)\s*{|\n\s*}$)/g;
      let methodMatch;
      let lastIndex = 0;
      
      while ((methodMatch = methodRegex.exec(methodsStr)) !== null) {
        try {
          const methodName = methodMatch[1];
          const methodParams = methodMatch[2];
          let methodBody = methodMatch[3].trim();
          
          // 确保方法体结尾有大括号
          if (!methodBody.endsWith('}')) {
            methodBody += '}';
          }
          
          newScriptContent += `const ${methodName} = (${methodParams}) => {\n${methodBody}\n\n`;
          lastIndex = methodRegex.lastIndex;
        } catch (error) {
          console.error(`  处理方法出错: ${methodMatch[0]}`, error);
        }
      }
      
      // 处理最后一个方法
      if (lastIndex < methodsStr.length) {
        const lastMethod = methodsStr.substring(lastIndex);
        const lastMethodMatch = lastMethod.match(/(\w+)\s*\(([^)]*)\)\s*{([\s\S]*)/);
        if (lastMethodMatch) {
          const methodName = lastMethodMatch[1];
          const methodParams = lastMethodMatch[2];
          let methodBody = lastMethodMatch[3].trim();
          if (methodBody.endsWith('}')) {
            methodBody = methodBody.slice(0, -1);
          }
          newScriptContent += `const ${methodName} = (${methodParams}) => {\n${methodBody}\n};\n\n`;
        }
      }
    }
    
    // 处理生命周期钩子
    if (createdStr || mountedStr) {
      newScriptContent += 'onMounted(() => {\n';
      if (createdStr) {
        newScriptContent += createdStr + '\n';
      }
      if (mountedStr) {
        newScriptContent += mountedStr + '\n';
      }
      newScriptContent += '});\n\n';
    }
    
    if (beforeDestroyStr) {
      newScriptContent += 'onBeforeUnmount(() => {\n';
      newScriptContent += beforeDestroyStr + '\n';
      newScriptContent += '});\n\n';
    }
    
    // 暴露方法给父组件调用
    const methodNames = [];
    if (methodsStr) {
      const methodNameRegex = /(\w+)\s*\([^)]*\)\s*{/g;
      let methodNameMatch;
      while ((methodNameMatch = methodNameRegex.exec(methodsStr)) !== null) {
        methodNames.push(methodNameMatch[1]);
      }
    }
    
    if (methodNames.length > 0) {
      newScriptContent += 'defineExpose({\n';
      methodNames.forEach(name => {
        newScriptContent += `  ${name},\n`;
      });
      newScriptContent += '});\n';
    }
    
    newScriptContent += '</script>\n';
    
    // 组合新的文件内容
    const newContent = template + '\n\n' + newScriptContent + '\n\n' + style;
    
    // 写入文件
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`  转换完成: ${filePath}`);
    
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
  
  console.log('转换完成！');
}

main();