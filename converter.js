// Java to Dart 转换器 JavaScript 方法
// 作者: AI Assistant
// 版本: 1.0.0

// ==================== 通用工具方法 ====================

// 显示标签页
function showTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有标签的激活状态
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的标签内容
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 激活选中的标签
    event.target.classList.add('active');
}

// 主Tab切换
function showMainTab(tabName) {
    // 隐藏所有主Tab内容
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有主Tab的激活状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的主Tab内容
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 激活选中的主Tab
    event.target.classList.add('active');
}

// 复制到剪贴板
async function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    try {
        await navigator.clipboard.writeText(element.value);
        showStatus('复制成功！', 'success');
    } catch (err) {
        // 降级方案
        element.select();
        document.execCommand('copy');
        showStatus('复制成功！', 'success');
    }
}

// 显示状态消息
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';
    
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}

// 通用文件下载函数
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== Java to Dart 类转换器 ====================

// 转换为 Dart 代码
function convertToDart() {
    const javaReq = document.getElementById('javaReq').value;
    const javaResp = document.getElementById('javaResp').value;
    
    if (!javaReq.trim() || !javaResp.trim()) {
        showStatus('请输入Java Request和Response类代码', 'error');
        return;
    }

    try {
        console.log('开始解析Java代码...');
        
        // 解析Java代码并生成Dart代码
        const reqResult = parseJavaClass(javaReq, 'Request');
        const respResult = parseJavaClass(javaResp, 'Response');
        
        console.log('解析结果 - reqResult:', reqResult);
        console.log('解析结果 - respResult:', respResult);
        
        // 检查解析结果
        if (!reqResult.className || !respResult.className) {
            throw new Error('无法解析Java类名');
        }
        
        if (!reqResult.fields || !respResult.fields) {
            throw new Error('无法解析Java字段');
        }
        
        // 生成Dart Request类
        const dartReqCode = generateDartClass(reqResult, 'Request');
        document.getElementById('dartReq').value = dartReqCode;
        console.log('生成Request类成功');
        
        // 生成Dart Response类
        const dartRespCode = generateDartClass(respResult, 'Response');
        document.getElementById('dartResp').value = dartRespCode;
        console.log('生成Response类成功');
        
        // 生成Service方法
        const serviceCode = generateServiceMethod(reqResult, respResult);
        document.getElementById('dartService').value = serviceCode;
        console.log('生成Service方法成功');
        
        // 生成使用示例
        const usageCode = generateUsageExample(reqResult, respResult);
        document.getElementById('dartUsage').value = usageCode;
        console.log('生成使用示例成功');
        
        // 生成API方法（如果用户勾选了生成API方法选项）
        const generateApiMethodChecked = document.getElementById('generateApiMethod').checked;
        if (generateApiMethodChecked) {
            const apiCode = generateApiMethodFromConfig(reqResult, respResult);
            document.getElementById('dartApi').value = apiCode;
            console.log('生成API方法成功');
        } else {
            document.getElementById('dartApi').value = '// 未启用API方法生成\n// 请勾选"生成API方法"选项并填写API配置';
        }
        
        // 更新文件路径
        updateFilePaths(reqResult, respResult);
        
        // 显示文件路径区域
        document.getElementById('filePathsSection').style.display = 'block';
        
        showStatus('转换成功！', 'success');
    } catch (error) {
        console.error('转换失败：', error);
        showStatus('转换失败：' + error.message, 'error');
    }
}

// 解析Java类
function parseJavaClass(javaCode, type) {
    const className = extractClassName(javaCode);
    const fields = extractFields(javaCode);
    
    return {
        className: className,
        dartClassName: convertToDartClassName(className),
        fields: fields,
        type: type
    };
}

// 提取类名
function extractClassName(javaCode) {
    const match = javaCode.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : 'UnknownClass';
}

// 提取字段
function extractFields(javaCode) {
    const fields = [];
    
    // 改进的字段匹配正则表达式，支持注解和注释
    const lines = javaCode.split('\n');
    let currentAnnotations = [];
    let currentComment = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 检测注解
        if (line.startsWith('@')) {
            currentAnnotations.push(line);
            continue;
        }
        
        // 检测注释
        if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
            currentComment = line.replace(/^[\/*\s*]+/, '').replace(/\*\/$/, '').trim();
            continue;
        }
        
        // 检测字段定义
        const fieldMatch = line.match(/private\s+(\w+(?:<[^>]*>)?)\s+(\w+);/);
        if (fieldMatch) {
            const javaType = fieldMatch[1];
            const fieldName = fieldMatch[2];
            const dartType = convertToDartType(javaType);
            const isRequired = isFieldRequired(currentAnnotations);
            
            fields.push({
                name: fieldName,
                javaType: javaType,
                dartType: dartType,
                isRequired: isRequired,
                annotations: [...currentAnnotations],
                comment: currentComment
            });
            
            // 重置状态
            currentAnnotations = [];
            currentComment = null;
        }
    }
    
    return fields;
}

// 改进的字段必需性判断
function isFieldRequired(annotations) {
    const requiredAnnotations = ['@NotBlank', '@NotNull', '@NotEmpty', '@Valid'];
    return annotations.some(annotation => 
        requiredAnnotations.some(req => annotation.includes(req))
    );
}

// 改进的Java类型到Dart类型转换
function convertToDartType(javaType) {
    const typeMap = {
        'String': 'String',
        'Integer': 'int',
        'Long': 'int',
        'Boolean': 'bool',
        'Double': 'double',
        'Float': 'double',
        'BigDecimal': 'double',
        'Date': 'DateTime',
        'LocalDateTime': 'DateTime',
        'LocalDate': 'DateTime',
        'List<String>': 'List<String>',
        'List<Integer>': 'List<int>',
        'List<Long>': 'List<int>',
        'List<Boolean>': 'List<bool>',
        'List<Double>': 'List<double>',
        'List<Float>': 'List<double>',
        'Map<String, String>': 'Map<String, String>',
        'Map<String, Object>': 'Map<String, dynamic>',
        'Map<String, Integer>': 'Map<String, int>',
        'Map<String, Boolean>': 'Map<String, bool>',
        'Object': 'dynamic',
        'Void': 'void'
    };
    
    // 处理泛型类型
    if (javaType.includes('<') && javaType.includes('>')) {
        const baseType = javaType.substring(0, javaType.indexOf('<'));
        const genericPart = javaType.substring(javaType.indexOf('<') + 1, javaType.lastIndexOf('>'));
        
        if (baseType === 'List') {
            const innerType = convertToDartType(genericPart.trim());
            return `List<${innerType}>`;
        } else if (baseType === 'Map') {
            const parts = genericPart.split(',').map(p => p.trim());
            if (parts.length === 2) {
                const keyType = convertToDartType(parts[0]);
                const valueType = convertToDartType(parts[1]);
                return `Map<${keyType}, ${valueType}>`;
            }
        }
    }
    
    return typeMap[javaType] || 'dynamic';
}

// 转换类名
function convertToDartClassName(javaClassName) {
    return javaClassName;
}

// 生成Dart类
function generateDartClass(classInfo, type) {
    let code = '';
    
    // 为Request类添加import语句
    if (type === 'Request') {
        code += `import 'package:http_xcontent/req_base_data.dart';\n\n`;
    }
    
    code += `/// ${classInfo.className}\n`;
    
    // 根据类型决定是否继承ReqBaseData
    if (type === 'Request') {
        code += `class ${classInfo.dartClassName} extends ReqBaseData {\n`;
    } else {
        code += `class ${classInfo.dartClassName} {\n`;
    }
    
    // 生成字段（Request类过滤掉ts字段）- 所有字段都设为可空
    classInfo.fields.forEach(field => {
        // Request类跳过ts字段的定义
        if (type === 'Request' && field.name === 'ts') {
            return;
        }
        
        // 所有字段都设为可空
        code += `  /// ${field.name}\n`;
        code += `  final ${field.dartType}? ${field.name};\n\n`;
    });
    
    // 生成构造函数 - 所有参数都为可选
    if (type === 'Request') {
        // Request类的构造函数需要调用super（过滤掉ts字段）
        code += `  ${classInfo.dartClassName}({\n`;
        classInfo.fields.forEach(field => {
            // Request类构造函数跳过ts字段
            if (field.name === 'ts') {
                return;
            }
            // 所有参数都为可选
            code += `    this.${field.name},\n`;
        });
        code += `  }) : super();\n\n`;
    } else {
        // Response类的普通构造函数 - 所有参数都为可选
        code += `  ${classInfo.dartClassName}({\n`;
        classInfo.fields.forEach(field => {
            // 所有参数都为可选
            code += `    this.${field.name},\n`;
        });
        code += `  });\n\n`;
    }
    
    // 根据类型决定生成哪些方法
    if (type === 'Response') {
        // Response类只生成fromJson方法 - 处理可空类型
        code += `  factory ${classInfo.dartClassName}.fromJson(Map<String, dynamic> json) {\n`;
        code += `    return ${classInfo.dartClassName}(\n`;
        classInfo.fields.forEach(field => {
            if (field.dartType.startsWith('List<')) {
                const innerType = field.dartType.match(/List<(.+)>/)[1];
                code += `      ${field.name}: json['${field.name}'] != null\n`;
                code += `          ? List<${innerType}>.from(json['${field.name}'])\n`;
                code += `          : null,\n`;
            } else if (field.dartType === 'int') {
                // 处理int类型的转换
                code += `      ${field.name}: json['${field.name}'] != null ? int.tryParse(json['${field.name}'].toString()) : null,\n`;
            } else if (field.dartType === 'double') {
                // 处理double类型的转换
                code += `      ${field.name}: json['${field.name}'] != null ? double.tryParse(json['${field.name}'].toString()) : null,\n`;
            } else if (field.dartType === 'bool') {
                // 处理bool类型的转换
                code += `      ${field.name}: json['${field.name}'] != null ? json['${field.name}'] as bool? : null,\n`;
            } else {
                // String和其他类型
                code += `      ${field.name}: json['${field.name}'] as ${field.dartType}?,\n`;
            }
        });
        code += `    );\n`;
        code += `  }\n\n`;
        
        // 为Response类也添加toJson方法
        code += `  Map<String, dynamic> toJson() {\n`;
        code += `    final Map<String, dynamic> data = {};\n`;
        classInfo.fields.forEach(field => {
            code += `    if (${field.name} != null) {\n`;
            code += `      data['${field.name}'] = ${field.name};\n`;
            code += `    }\n`;
        });
        code += `    return data;\n`;
        code += `  }\n`;
    } else if (type === 'Request') {
        // Request类重写toJson方法 - 处理可空类型
        code += `  @override\n`;
        code += `  Map<String, dynamic> toJson() {\n`;
        code += `    final Map<String, dynamic> data = {\n`;
        code += `      ...super.toJson(), // 包含父类的字段\n`;
        code += `      'ts': ts, // 时间戳字段\n`;
        code += `    };\n\n`;
        
        // 添加当前类的字段（过滤掉ts）- 只有非空值才添加
        classInfo.fields.forEach(field => {
            if (field.name !== 'ts') {
                code += `    if (${field.name} != null) {\n`;
                code += `      data['${field.name}'] = ${field.name};\n`;
                code += `    }\n`;
            }
        });
        
        code += `    return data;\n`;
        code += `  }\n`;
    }
    
    code += `}`;
    
    return code;
}

// 生成Service方法
function generateServiceMethod(reqInfo, respInfo) {
    console.log('generateServiceMethod called with:', { reqInfo, respInfo });
    
    if (!reqInfo || !respInfo) {
        throw new Error('reqInfo 或 respInfo 未定义');
    }
    
    if (!reqInfo.className || !respInfo.className) {
        throw new Error('类名未定义');
    }
    
    // const methodName = reqInfo.className.replace('Req', '').replace(/([A-Z])/g, (match, p1, offset) => {
    //     return offset > 0 ? '_' + match.toLowerCase() : match.toLowerCase();
    // });
    let methodName = document.getElementById('methodName').value.trim();
    let code = `/// ${reqInfo.className.replace('Req', '')} 请求\n`;
    code += `/// 参数: ${reqInfo.className}\n`;
    code += `/// 返回: ${respInfo.className}\n`;
    code += `static Future<${respInfo.className}?> ${methodName}({\n`;
    
    // 生成参数 - 所有参数都为可空类型
    if (reqInfo.fields && Array.isArray(reqInfo.fields)) {
        reqInfo.fields.forEach(field => {
            if (field.name === 'ts') return; // 跳过时间戳参数，自动生成
            // 所有参数都为可空类型，不使用required
            code += `  ${field.dartType}? ${field.name},\n`;
        });
    }
    
    code += `}) async {\n`;
    code += `  try {\n`;
    
    code += `    final request = ${reqInfo.className}(\n`;
    if (reqInfo.fields && Array.isArray(reqInfo.fields)) {
        reqInfo.fields.forEach(field => {
            if (field.name === 'ts') return;
            code += `      ${field.name}: ${field.name},\n`;
        });
    }
    code += `    );\n\n`;
    
    // 生成API URL的获取方法
    const apiMethodName = reqInfo.className.replace('Req', '').replace(/([A-Z])/g, (match, p1, offset) => {
        return offset > 0 ? '_' + match.toLowerCase() : match.toLowerCase();
    }) + '_url';
    
    code += `    final url = await UrlConstDef.${methodName}();\n`;
    code += `    var content = jsonEncode(request);\n`;
    code += `    var response = await ReqBaseService.mContentEncodeReq(url, content);\n`;
    code += `    if(response!=null){\n`; 
    code += `      return ${respInfo.className}.fromJson(response);\n`;
    code += `    }\n`; 
    code += `    return null;\n`;
    code += `  } catch (e) {\n`;
    code += `    print('请求异常: $e');\n`;
    code += `    return null;\n`;
    code += `  }\n`;
    code += `}`;
    
    console.log('生成的Service代码:', code);
    return code;
}

// 生成使用示例
function generateUsageExample(reqInfo, respInfo) {
    console.log('generateUsageExample called with:', { reqInfo, respInfo });
    
    if (!reqInfo || !respInfo) {
        throw new Error('reqInfo 或 respInfo 未定义');
    }
    
    if (!reqInfo.className || !respInfo.className) {
        throw new Error('类名未定义');
    }
    
    const methodName = reqInfo.className.replace('Req', '').replace(/([A-Z])/g, (match, p1, offset) => {
        return offset > 0 ? '_' + match.toLowerCase() : match.toLowerCase();
    });
    
    let code = `// 使用示例\n\n`;
    code += `void main() async {\n`;
    code += `  // 创建服务实例\n`;
    code += `  final apiService = ApiService();\n\n`;
    
    code += `  // 调用方法\n`;
    code += `  final response = await apiService.${methodName}(\n`;
    
    // 生成示例参数
    if (reqInfo.fields && Array.isArray(reqInfo.fields)) {
        reqInfo.fields.forEach(field => {
            if (field.name === 'ts') return; // 跳过时间戳参数
            
            let exampleValue;
            switch (field.dartType) {
                case 'String':
                    if (field.name.toLowerCase().includes('time')) {
                        exampleValue = "'2024-09-27 00:00:00'";
                    } else if (field.name.toLowerCase().includes('chord')) {
                        exampleValue = "'I-V-vi-IV'";
                    } else if (field.name.toLowerCase().includes('key')) {
                        exampleValue = "'C'";
                    } else if (field.name.toLowerCase().includes('bpm')) {
                        exampleValue = "'120'";
                    } else {
                        exampleValue = `'example_${field.name}'`;
                    }
                    break;
                case 'int':
                    exampleValue = '123';
                    break;
                case 'bool':
                    exampleValue = 'true';
                    break;
                case 'double':
                    exampleValue = '123.45';
                    break;
                case 'DateTime':
                    exampleValue = 'DateTime.now()';
                    break;
                default:
                    exampleValue = field.isRequired ? "'example_value'" : 'null';
            }
            
            code += `    ${field.name}: ${exampleValue},\n`;
        });
    }
    
    code += `  );\n\n`;
    
    code += `  // 处理响应\n`;
    code += `  if (response != null) {\n`;
    code += `    print('请求成功');\n`;
    
    // 根据响应字段生成处理示例
    if (respInfo.fields && Array.isArray(respInfo.fields)) {
        respInfo.fields.forEach(field => {
            code += `    print('${field.name}: \${response.${field.name}}');\n`;
        });
    }
    
    code += `  } else {\n`;
    code += `    print('请求失败');\n`;
    code += `  }\n`;
    code += `}`;
    
    console.log('生成的使用示例代码:', code);
    return code;
}

// 更新文件路径
function updateFilePaths(reqResult, respResult) {
    const reqFileName = convertToDartFileName(reqResult.className);
    const respFileName = convertToDartFileName(respResult.className);
    
    // 获取方法名来生成API文件名
    const methodName = document.getElementById('methodName').value.trim() || 'api_method';
    const apiFileName = convertToSnakeCase(methodName) + '_api';
    
    document.getElementById('reqModelPath').textContent = `lib/model/${reqFileName}.dart`;
    document.getElementById('respModelPath').textContent = `lib/model/${respFileName}.dart`;
    document.getElementById('apiServicePath').textContent = 'lib/service/api_service.dart';
    document.getElementById('apiMethodPath').textContent = `lib/api/${apiFileName}.dart`;
    document.getElementById('usageExamplePath').textContent = 'example/usage_example.dart';
}

// 转换类名为文件名
function convertToDartFileName(className) {
    return className.replace(/([A-Z])/g, (match, p1, offset) => {
        return offset > 0 ? '_' + match.toLowerCase() : match.toLowerCase();
    });
}

// 清空所有内容
function clearAll() {
    document.getElementById('javaReq').value = '';
    document.getElementById('javaResp').value = '';
    document.getElementById('dartReq').value = '';
    document.getElementById('dartResp').value = '';
    document.getElementById('dartService').value = '';
    document.getElementById('dartApi').value = '';
    document.getElementById('dartUsage').value = '';
    
    // 清空API配置字段
    document.getElementById('apiDescription').value = '';
    document.getElementById('apiPath').value = '';
    document.getElementById('methodName').value = '';
    document.getElementById('hostConstant').selectedIndex = 0;
    document.getElementById('returnType').selectedIndex = 0;
    document.getElementById('generateApiMethod').checked = true;
    document.getElementById('includeComment').checked = true;
    document.getElementById('staticMethod').checked = true;
    document.getElementById('asyncMethod').checked = true;
    
    // 隐藏文件路径区域
    document.getElementById('filePathsSection').style.display = 'none';
    
    showStatus('已清空所有内容', 'info');
}

// 加载示例
function loadExample() {
    document.getElementById('javaReq').value = `public class Chord2SongTaskReq {
    @NotBlank(message = "param operatorType can not be blank")
    private String operatorType;
    
    private String prompt;
    
    private String lyric;
    
    @NotBlank(message = "userChord is blank")
    private String userChord;
    
    @NotBlank(message = "key is blank")
    private String key;
    
    @NotBlank(message = "bpm is blank")
    private String bpm;
    
    @NotNull(message = "param ts can not be null")
    private Long ts;
    
    @NotBlank(message = "userTime is blank")
    private String userTime;
    
    @NotBlank(message = "param pageSource can not be blank")
    private String pageSource;
}`;

    document.getElementById('javaResp').value = `public class Chord2SongTaskResp {
    private Boolean result;
    
    private List<String> itemIds;
}`;
    
    // 加载API配置示例
    document.getElementById('apiDescription').value = '请求AI生成歌词接口';
    document.getElementById('apiPath').value = '/api/v1/c2s/submitDtlTask';
    document.getElementById('hostConstant').value = 'HOST_SOLO';
    document.getElementById('methodName').value = 'submitDtlTask';
    document.getElementById('generateApiMethod').checked = true;
    
    showStatus('示例代码已加载', 'success');
}

// ==================== 文件下载相关方法 ====================

// 复制单个文件路径
async function copyFilePath(pathElementId) {
    const pathElement = document.getElementById(pathElementId);
    const path = pathElement.textContent;
    
    try {
        await navigator.clipboard.writeText(path);
        showStatus(`路径已复制: ${path}`, 'success');
        
        // 临时改变按钮样式表示复制成功
        const button = pathElement.nextElementSibling;
        const originalText = button.textContent;
        button.textContent = '✓';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#007bff';
        }, 1000);
    } catch (err) {
        showStatus('复制失败', 'error');
    }
}

// 复制所有文件路径
async function copyAllPaths() {
    const paths = [
        document.getElementById('reqModelPath').textContent,
        document.getElementById('respModelPath').textContent,
        document.getElementById('apiServicePath').textContent,
        document.getElementById('usageExamplePath').textContent
    ];
    
    const pathsText = '生成的文件路径:\n' + paths.map((path, index) => {
        const labels = ['Request 模型', 'Response 模型', 'API 服务', '使用示例'];
        return `${index + 1}. ${labels[index]}: ${path}`;
    }).join('\n');
    
    try {
        await navigator.clipboard.writeText(pathsText);
        showStatus('所有路径已复制到剪贴板', 'success');
    } catch (err) {
        showStatus('复制失败', 'error');
    }
}

// 下载项目结构文件
function downloadProjectStructure() {
    const reqPath = document.getElementById('reqModelPath').textContent;
    const respPath = document.getElementById('respModelPath').textContent;
    const servicePath = document.getElementById('apiServicePath').textContent;
    const usagePath = document.getElementById('usageExamplePath').textContent;
    
    const reqCode = document.getElementById('dartReq').value;
    const respCode = document.getElementById('dartResp').value;
    const serviceCode = document.getElementById('dartService').value;
    const usageCode = document.getElementById('dartUsage').value;
    
    const projectStructure = {
        "README.md": generateReadmeContent(),
        "pubspec.yaml": generatePubspecContent(),
        [reqPath]: reqCode,
        [respPath]: respCode,
        [servicePath]: serviceCode,
        [usagePath]: usageCode
    };
    
    const blob = new Blob([JSON.stringify(projectStructure, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dart_project_structure.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('项目结构已下载', 'success');
}

// 生成README内容
function generateReadmeContent() {
    return `# Dart API Client

这是由 Java to Dart 转换器自动生成的 Dart API 客户端代码。

## 文件结构

- \`${document.getElementById('reqModelPath').textContent}\` - Request 模型类
- \`${document.getElementById('respModelPath').textContent}\` - Response 模型类  
- \`${document.getElementById('apiServicePath').textContent}\` - API 服务类
- \`${document.getElementById('usageExamplePath').textContent}\` - 使用示例

## 使用方法

1. 将生成的文件放到对应的目录
2. 在 pubspec.yaml 中添加依赖
3. 参考使用示例调用 API

## 依赖

\`\`\`yaml
dependencies:
  http: ^1.1.0
\`\`\`

生成时间: ${new Date().toLocaleString()}
`;
}

// 生成pubspec.yaml内容
function generatePubspecContent() {
    return `name: dart_api_client
description: Auto-generated Dart API client
version: 1.0.0

environment:
  sdk: '>=2.17.0 <4.0.0'

dependencies:
  http: ^1.1.0

dev_dependencies:
  test: ^1.21.0
`;
}

// 下载单个文件
function downloadSingleFile(fileType) {
    let content = '';
    let filename = '';
    
    switch (fileType) {
        case 'req':
            content = document.getElementById('dartReq').value;
            filename = document.getElementById('reqModelPath').textContent.split('/').pop();
            break;
        case 'resp':
            content = document.getElementById('dartResp').value;
            filename = document.getElementById('respModelPath').textContent.split('/').pop();
            break;
        case 'service':
            content = document.getElementById('dartService').value;
            filename = 'api_service.dart';
            break;
        case 'api':
            content = document.getElementById('dartApi').value;
            filename = document.getElementById('apiMethodPath').textContent.split('/').pop();
            break;
        case 'usage':
            content = document.getElementById('dartUsage').value;
            filename = 'usage_example.dart';
            break;
        default:
            showStatus('未知的文件类型', 'error');
            return;
    }
    
    if (!content.trim()) {
        showStatus('文件内容为空，请先生成代码', 'error');
        return;
    }
    
    downloadFile(content, filename);
    showStatus(`${filename} 下载成功`, 'success');
}

// 下载所有Dart文件
function downloadAllFiles() {
    const files = [
        { content: document.getElementById('dartReq').value, filename: document.getElementById('reqModelPath').textContent.split('/').pop() },
        { content: document.getElementById('dartResp').value, filename: document.getElementById('respModelPath').textContent.split('/').pop() },
        { content: document.getElementById('dartService').value, filename: 'api_service.dart' },
        { content: document.getElementById('dartApi').value, filename: document.getElementById('apiMethodPath').textContent.split('/').pop() },
        { content: document.getElementById('dartUsage').value, filename: 'usage_example.dart' }
    ];
    
    let downloadedCount = 0;
    files.forEach((file, index) => {
        if (file.content.trim()) {
            setTimeout(() => {
                downloadFile(file.content, file.filename);
                downloadedCount++;
                if (downloadedCount === files.filter(f => f.content.trim()).length) {
                    showStatus(`成功下载 ${downloadedCount} 个文件`, 'success');
                }
            }, index * 200); // 间隔200ms避免浏览器阻止多个下载
        }
    });
    
    if (downloadedCount === 0) {
        showStatus('没有可下载的文件，请先生成代码', 'error');
    }
}

// 下载ZIP文件包
async function downloadZipFile() {
    if (typeof JSZip === 'undefined') {
        // 如果JSZip库不存在，回退到批量下载
        showStatus('ZIP功能不可用，正在批量下载文件...', 'info');
        downloadAllFiles();
        return;
    }
    
    const zip = new JSZip();
    const reqContent = document.getElementById('dartReq').value;
    const respContent = document.getElementById('dartResp').value;
    const serviceContent = document.getElementById('dartService').value;
    const apiContent = document.getElementById('dartApi').value;
    const usageContent = document.getElementById('dartUsage').value;
    
    if (!reqContent.trim() && !respContent.trim() && !serviceContent.trim() && !apiContent.trim() && !usageContent.trim()) {
        showStatus('没有可打包的文件，请先生成代码', 'error');
        return;
    }
    
    // 创建目录结构
    const modelFolder = zip.folder("lib/model");
    const serviceFolder = zip.folder("lib/service");
    const apiFolder = zip.folder("lib/api");
    const exampleFolder = zip.folder("example");
    
    // 添加文件到ZIP
    if (reqContent.trim()) {
        const reqFilename = document.getElementById('reqModelPath').textContent.split('/').pop();
        modelFolder.file(reqFilename, reqContent);
    }
    
    if (respContent.trim()) {
        const respFilename = document.getElementById('respModelPath').textContent.split('/').pop();
        modelFolder.file(respFilename, respContent);
    }
    
    if (serviceContent.trim()) {
        serviceFolder.file("api_service.dart", serviceContent);
    }
    
    if (apiContent.trim()) {
        const apiFilename = document.getElementById('apiMethodPath').textContent.split('/').pop();
        apiFolder.file(apiFilename, apiContent);
    }
    
    if (usageContent.trim()) {
        exampleFolder.file("usage_example.dart", usageContent);
    }
    
    // 添加README和pubspec.yaml
    zip.file("README.md", generateReadmeContent());
    zip.file("pubspec.yaml", generatePubspecContent());
    
    // 生成并下载ZIP文件
    try {
        const content = await zip.generateAsync({type:"blob"});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dart_api_client.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('ZIP文件下载成功', 'success');
    } catch (error) {
        showStatus('ZIP文件生成失败，正在批量下载文件...', 'error');
        downloadAllFiles();
    }
}

// ==================== JSON工具方法 ====================

function formatJson() {
    const input = document.getElementById('jsonInput').value.trim();
    const output = document.getElementById('jsonOutput');
    
    if (!input) {
        showStatus('请输入JSON数据', 'error');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        output.value = JSON.stringify(parsed, null, 2);
        updateJsonInfo(parsed);
        showStatus('JSON格式化成功', 'success');
    } catch (error) {
        showStatus('JSON格式错误: ' + error.message, 'error');
    }
}

function compressJson() {
    const input = document.getElementById('jsonInput').value.trim();
    const output = document.getElementById('jsonOutput');
    
    if (!input) {
        showStatus('请输入JSON数据', 'error');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        output.value = JSON.stringify(parsed);
        updateJsonInfo(parsed);
        showStatus('JSON压缩成功', 'success');
    } catch (error) {
        showStatus('JSON格式错误: ' + error.message, 'error');
    }
}

function validateJson() {
    const input = document.getElementById('jsonInput').value.trim();
    
    if (!input) {
        showStatus('请输入JSON数据', 'error');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        updateJsonInfo(parsed);
        showStatus('JSON格式正确 ✅', 'success');
    } catch (error) {
        showStatus('JSON格式错误: ' + error.message, 'error');
    }
}

function jsonToDart() {
    const input = document.getElementById('jsonInput').value.trim();
    const output = document.getElementById('jsonOutput');
    
    if (!input) {
        showStatus('请输入JSON数据', 'error');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        const dartClass = generateDartFromJson(parsed, 'GeneratedClass');
        output.value = dartClass;
        showStatus('JSON转Dart类成功', 'success');
    } catch (error) {
        showStatus('转换失败: ' + error.message, 'error');
    }
}

function updateJsonInfo(jsonData) {
    const info = document.getElementById('jsonInfo');
    const size = JSON.stringify(jsonData).length;
    const keys = Object.keys(jsonData).length;
    const type = Array.isArray(jsonData) ? 'Array' : 'Object';
    
    info.innerHTML = `
        <strong>类型:</strong> ${type}<br>
        <strong>大小:</strong> ${size} 字符<br>
        <strong>键数量:</strong> ${keys}<br>
        <strong>层级:</strong> ${getJsonDepth(jsonData)}
    `;
}

function getJsonDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    return 1 + Math.max(0, ...Object.values(obj).map(getJsonDepth));
}

function generateDartFromJson(json, className) {
    let code = `class ${className} {\n`;
    
    // 生成字段
    for (const [key, value] of Object.entries(json)) {
        const dartType = getDartTypeFromValue(value);
        code += `  final ${dartType}? ${key};\n`;
    }
    
    code += `\n  ${className}({\n`;
    
    // 生成构造函数参数
    for (const key of Object.keys(json)) {
        code += `    this.${key},\n`;
    }
    
    code += `  });\n\n`;
    
    // 生成fromJson方法
    code += `  factory ${className}.fromJson(Map<String, dynamic> json) {\n`;
    code += `    return ${className}(\n`;
    
    for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
            const innerType = value.length > 0 ? getDartTypeFromValue(value[0]) : 'dynamic';
            code += `      ${key}: json['${key}'] != null ? List<${innerType}>.from(json['${key}']) : null,\n`;
        } else {
            code += `      ${key}: json['${key}'],\n`;
        }
    }
    
    code += `    );\n`;
    code += `  }\n`;
    code += `}`;
    
    return code;
}

function getDartTypeFromValue(value) {
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'int' : 'double';
    }
    if (typeof value === 'boolean') return 'bool';
    if (Array.isArray(value)) {
        const innerType = value.length > 0 ? getDartTypeFromValue(value[0]) : 'dynamic';
        return `List<${innerType}>`;
    }
    if (typeof value === 'object' && value !== null) return 'Map<String, dynamic>';
    return 'dynamic';
}

// ==================== 枚举转换器方法 ====================

// 枚举转换相关函数
function convertEnumToDart() {
    const javaEnum = document.getElementById('javaEnum').value.trim();
    const dartEnumOutput = document.getElementById('dartEnum');
    
    if (!javaEnum) {
        showStatus('请输入Java枚举代码', 'error');
        return;
    }
    
    try {
        const enumInfo = parseJavaEnum(javaEnum);
        const dartCode = generateDartEnum(enumInfo);
        dartEnumOutput.value = dartCode;
        
        // 更新枚举文件路径
        updateEnumFilePath(enumInfo);
        
        // 显示文件路径区域
        document.getElementById('enumFilePathsSection').style.display = 'block';
        
        showStatus('枚举转换成功', 'success');
    } catch (error) {
        showStatus('转换失败: ' + error.message, 'error');
    }
}

function parseJavaEnum(javaCode) {
    // 提取枚举名
    const enumNameMatch = javaCode.match(/enum\s+(\w+)/);
    if (!enumNameMatch) {
        throw new Error('无法找到枚举定义');
    }
    const enumName = enumNameMatch[1];
    
    // 提取枚举值部分（从第一个{到分号;）
    const enumBodyMatch = javaCode.match(/\{([^}]*);/);
    if (!enumBodyMatch) {
        // 如果没有分号，尝试匹配整个枚举体
        const simpleEnumMatch = javaCode.match(/\{([^}]+)\}/);
        if (!simpleEnumMatch) {
            throw new Error('无法找到枚举值');
        }
    }
    
    const enumValuesText = enumBodyMatch ? enumBodyMatch[1] : javaCode.match(/\{([^}]+)\}/)[1];
    const enumValues = [];
    
    // 分割枚举值（按逗号分割，但要考虑括号内的逗号）
    const valueStrings = splitEnumValues(enumValuesText);
    
    valueStrings.forEach(valueStr => {
        const trimmed = valueStr.trim();
        if (!trimmed || trimmed.includes('private') || trimmed.includes('public')) {
            return;
        }
        
        // 解析枚举值：NAME 或 NAME(param1, param2)
        const match = trimmed.match(/(\w+)\s*(?:\(([^)]+)\))?/);
        if (match) {
            const name = match[1];
            const params = match[2] ? 
                match[2].split(',').map(p => p.trim().replace(/['"]/g, '')) : 
                [];
            
            enumValues.push({
                name: name,
                params: params
            });
        }
    });
    
    // 提取字段信息
    const fields = [];
    const fieldPattern = /private\s+final\s+(\w+)\s+(\w+);/g;
    let match;
    while ((match = fieldPattern.exec(javaCode)) !== null) {
        fields.push({
            type: match[1],
            name: match[2]
        });
    }
    
    // 如果没有显式字段定义，但有带参数的枚举值，自动推断字段
    if (fields.length === 0 && enumValues.some(v => v.params.length > 0)) {
        // 找到参数最多的枚举值作为字段数量基准
        const maxParams = Math.max(...enumValues.map(v => v.params.length));
        
        for (let i = 0; i < maxParams; i++) {
            // 自动推断字段类型和名称
            let fieldType = 'String'; // 默认类型
            let fieldName = `value${i + 1}`; // 默认名称
            
            // 尝试从第一个非空参数推断类型
            for (const enumValue of enumValues) {
                if (enumValue.params[i] !== undefined) {
                    const param = enumValue.params[i].toString();
                    
                    // 检查是否为数字
                    if (/^-?\d+$/.test(param)) {
                        fieldType = 'int';
                        fieldName = i === 0 ? 'type' : `value${i + 1}`;
                    } else if (/^-?\d+\.\d+$/.test(param)) {
                        fieldType = 'double';
                        fieldName = i === 0 ? 'value' : `value${i + 1}`;
                    } else if (param === 'true' || param === 'false') {
                        fieldType = 'bool';
                        fieldName = i === 0 ? 'flag' : `value${i + 1}`;
                    } else {
                        fieldType = 'String';
                        fieldName = i === 0 ? 'code' : `description`;
                    }
                    break;
                }
            }
            
            fields.push({
                type: fieldType,
                name: fieldName
            });
        }
    }
    
    return {
        name: enumName,
        values: enumValues,
        fields: fields
    };
}

// 辅助函数：分割枚举值，考虑括号内的逗号
function splitEnumValues(text) {
    const values = [];
    let current = '';
    let parenthesesCount = 0;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '(') {
            parenthesesCount++;
        } else if (char === ')') {
            parenthesesCount--;
        } else if (char === ',' && parenthesesCount === 0) {
            if (current.trim()) {
                values.push(current.trim());
            }
            current = '';
            continue;
        }
        
        current += char;
    }
    
    if (current.trim()) {
        values.push(current.trim());
    }
    
    return values;
}

function generateDartEnum(enumInfo) {
    const generateExtension = document.getElementById('generateExtension').checked;
    const generateFromString = document.getElementById('generateFromString').checked;
    const generateDescription = document.getElementById('generateDescription').checked;
    const namingStyle = document.getElementById('enumNamingStyle').value;
    
    let code = `/// ${enumInfo.name} 枚举\n`;
    code += `enum ${enumInfo.name} {\n`;
    
    // 生成枚举值
    enumInfo.values.forEach((value, index) => {
        const dartName = convertEnumValueName(value.name, namingStyle);
        if (value.params.length > 0) {
            code += `  ${dartName}(`;
            // 处理所有参数
            value.params.forEach((param, paramIndex) => {
                // 根据字段类型决定是否需要引号
                const field = enumInfo.fields[paramIndex];
                const fieldType = field ? convertJavaTypeToDart(field.type) : 'String';
                
                if (fieldType === 'int' || fieldType === 'double' || fieldType === 'bool') {
                    code += param;
                } else {
                    code += `'${param}'`;
                }
                
                if (paramIndex < value.params.length - 1) {
                    code += ', ';
                }
            });
            code += ')';
        } else {
            code += `  ${dartName}`;
        }
        
        if (index < enumInfo.values.length - 1) {
            code += ',\n';
        } else {
            code += ';\n';
        }
    });
    
    // 生成构造函数和字段
    if (enumInfo.fields.length > 0) {
        code += '\n';
        
        // 生成构造函数
        code += `  const ${enumInfo.name}(`;
        enumInfo.fields.forEach((field, index) => {
            code += `this.${field.name}`;
            if (index < enumInfo.fields.length - 1) {
                code += ', ';
            }
        });
        code += ');\n\n';
        
        // 生成字段
        enumInfo.fields.forEach(field => {
            const dartType = convertJavaTypeToDart(field.type);
            code += `  final ${dartType} ${field.name};\n`;
        });
    }
    
    code += '}\n';
    
    // 生成扩展方法
    if (generateExtension) {
        code += '\n';
        code += `extension ${enumInfo.name}Extension on ${enumInfo.name} {\n`;
        
        if (generateDescription && enumInfo.fields.length > 1) {
            const descField = enumInfo.fields.find(f => f.name.includes('description') || f.name.includes('message')) || enumInfo.fields[1];
            code += `  String get description {\n`;
            code += `    switch (this) {\n`;
            enumInfo.values.forEach(value => {
                const dartName = convertEnumValueName(value.name, namingStyle);
                const description = value.params.length > 1 ? value.params[1] : value.params[0] || value.name;
                code += `      case ${enumInfo.name}.${dartName}:\n`;
                code += `        return '${description}';\n`;
            });
            code += `    }\n`;
            code += `  }\n\n`;
        }
        
        if (enumInfo.fields.length > 0) {
            // 为每个字段生成getter方法
            enumInfo.fields.forEach((field, fieldIndex) => {
                const fieldType = convertJavaTypeToDart(field.type);
                
                code += `  ${fieldType} get ${field.name} {\n`;
                code += `    switch (this) {\n`;
                enumInfo.values.forEach(value => {
                    const dartName = convertEnumValueName(value.name, namingStyle);
                    const paramValue = value.params.length > fieldIndex ? value.params[fieldIndex] : value.name.toLowerCase();
                    
                    // 以Java的定义类型为准，不进行类型转换，直接使用原始参数值
                    code += `      case ${enumInfo.name}.${dartName}:\n`;
                    code += `        return ${paramValue};\n`;
                });
                code += `    }\n`;
                code += `  }\n`;
                
                if (fieldIndex < enumInfo.fields.length - 1) {
                    code += '\n';
                }
            });
        }
        
        if (generateFromString) {
            code += '\n';
            code += `  static ${enumInfo.name}? fromString(String value) {\n`;
            code += `    switch (value.toLowerCase()) {\n`;
            enumInfo.values.forEach(value => {
                const dartName = convertEnumValueName(value.name, namingStyle);
                // 使用第一个参数作为匹配值，如果没有参数则使用枚举名
                const matchValue = value.params.length > 0 ? value.params[0] : value.name.toLowerCase();
                code += `      case '${matchValue.toString().toLowerCase()}':\n`;
                code += `        return ${enumInfo.name}.${dartName};\n`;
            });
            code += `      default:\n`;
            code += `        return null;\n`;
            code += `    }\n`;
            code += `  }\n`;
        }
        
        code += '}\n';
    }
    
    return code;
}

// 辅助函数：转换Java类型到Dart类型
function convertJavaTypeToDart(javaType) {
    const typeMap = {
        'String': 'String',
        'int': 'int',
        'Integer': 'int',
        'Long': 'int',
        'Boolean': 'bool',
        'Double': 'double',
        'Float': 'double'
    };
    return typeMap[javaType] || 'dynamic';
}

function convertEnumValueName(javaName, style) {
    switch (style) {
        case 'camelCase':
            return javaName.toLowerCase().replace(/_(.)/g, (match, letter) => letter.toUpperCase());
        case 'PascalCase':
            const camelCase = javaName.toLowerCase().replace(/_(.)/g, (match, letter) => letter.toUpperCase());
            return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
        case 'snake_case':
            return javaName.toLowerCase();
        case 'UPPER_CASE':
            return javaName.toUpperCase();
        default:
            return javaName.toLowerCase();
    }
}

function clearEnumFields() {
    document.getElementById('javaEnum').value = '';
    document.getElementById('dartEnum').value = '';
    
    // 隐藏文件路径区域
    document.getElementById('enumFilePathsSection').style.display = 'none';
    
    showStatus('已清空枚举字段', 'info');
}

function loadEnumExample() {
    const examples = [
        // 示例1：带构造函数的枚举
        `public enum UserStatus {
    ACTIVE("active", "激活"),
    INACTIVE("inactive", "未激活"),
    SUSPENDED("suspended", "暂停"),
    DELETED("deleted", "已删除");
    
    private final String code;
    private final String description;
    
    UserStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
}`,
        // 示例2：简单枚举
        `public enum Color {
    RED,
    GREEN,
    BLUE,
    YELLOW
}`,
        // 示例3：复杂枚举
        `public enum HttpStatus {
    OK(200, "成功"),
    BAD_REQUEST(400, "请求错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "未找到"),
    INTERNAL_SERVER_ERROR(500, "服务器内部错误");
    
    private final int code;
    private final String message;
    
    HttpStatus(int code, String message) {
        this.code = code;
        this.message = message;
    }
    
    public int getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
}`,
        // 示例4：用户提供的FlowStateEnum - 自动推断字段类型
        `enum FlowStateEnum {
  notFound(-1),
  init(0),
  running(1),
  success(2),
  fail(3);
}`
    ];
    
    // 随机选择一个示例，或者按顺序循环
    const currentExample = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('javaEnum').value = currentExample;
    showStatus('示例枚举已加载', 'success');
}

// 更新枚举文件路径
function updateEnumFilePath(enumInfo) {
    const enumFileName = convertToDartFileName(enumInfo.name);
    document.getElementById('enumFilePath').textContent = `lib/enums/${enumFileName}.dart`;
}

// 下载枚举文件
function downloadEnumFile() {
    const dartEnumCode = document.getElementById('dartEnum').value.trim();
    
    if (!dartEnumCode) {
        showStatus('请先转换枚举代码', 'error');
        return;
    }
    
    // 从文件路径中提取文件名
    const filePath = document.getElementById('enumFilePath').textContent;
    const fileName = filePath.split('/').pop();
    
    downloadFile(dartEnumCode, fileName);
    showStatus(`${fileName} 下载成功`, 'success');
}

// 复制枚举文件路径
async function copyEnumFilePath() {
    const filePath = document.getElementById('enumFilePath').textContent;
    
    try {
        await navigator.clipboard.writeText(filePath);
        showStatus(`路径已复制: ${filePath}`, 'success');
    } catch (err) {
        showStatus('复制失败', 'error');
    }
}

// 下载枚举文件含使用示例
function downloadEnumWithExample() {
    const dartEnumCode = document.getElementById('dartEnum').value.trim();
    
    if (!dartEnumCode) {
        showStatus('请先转换枚举代码', 'error');
        return;
    }
    
    // 生成使用示例
    const enumInfo = getCurrentEnumInfo();
    const usageExample = generateEnumUsageExample(enumInfo);
    
    // 合并枚举代码和使用示例
    const combinedCode = dartEnumCode + '\n\n' + usageExample;
    
    const filePath = document.getElementById('enumFilePath').textContent;
    const fileName = filePath.split('/').pop().replace('.dart', '_with_example.dart');
    
    downloadFile(combinedCode, fileName);
    showStatus(`文件 ${fileName} 下载成功`, 'success');
}

// 获取当前枚举信息（从输入框重新解析）
function getCurrentEnumInfo() {
    const javaEnum = document.getElementById('javaEnum').value.trim();
    if (!javaEnum) return null;
    
    try {
        return parseJavaEnum(javaEnum);
    } catch (error) {
        return null;
    }
}

// 生成枚举使用示例
function generateEnumUsageExample(enumInfo) {
    if (!enumInfo) return '';
    
    let example = `\n// ${enumInfo.name} 使用示例\nvoid main() {\n`;
    
    // 基本使用
    example += `  // 基本使用\n`;
    if (enumInfo.values.length > 0) {
        const firstValue = convertEnumValueName(enumInfo.values[0].name, 'camelCase');
        example += `  final status = ${enumInfo.name}.${firstValue};\n`;
        example += `  print('枚举值: \$status');\n\n`;
    }
    
    // 如果有扩展方法
    const generateExtension = document.getElementById('generateExtension').checked;
    if (generateExtension && enumInfo.fields.length > 0) {
        example += `  // 使用扩展方法\n`;
        const codeField = enumInfo.fields.find(f => f.name.includes('code')) || enumInfo.fields[0];
        example += `  print('${codeField.name}: \${status.${codeField.name}}');\n`;
        
        if (enumInfo.fields.length > 1) {
            example += `  print('description: \${status.description}');\n`;
        }
        example += `\n`;
    }
    
    // fromString 示例
    const generateFromString = document.getElementById('generateFromString').checked;
    if (generateFromString) {
        example += `  // 从字符串创建枚举\n`;
        if (enumInfo.values.length > 0) {
            const firstValue = enumInfo.values[0];
            const codeValue = firstValue.params.length > 0 ? firstValue.params[0] : firstValue.name.toLowerCase();
            example += `  final fromString = ${enumInfo.name}Extension.fromString('${codeValue}');\n`;
            example += `  print('从字符串创建: \$fromString');\n\n`;
        }
    }
    
    // 遍历所有值
    example += `  // 遍历所有枚举值\n`;
    example += `  for (final value in ${enumInfo.name}.values) {\n`;
    if (generateExtension && enumInfo.fields.length > 0) {
        const codeField = enumInfo.fields.find(f => f.name.includes('code')) || enumInfo.fields[0];
        example += `    print('\${value.name}: \${value.${codeField.name}}');\n`;
    } else {
        example += `    print(value.name);\n`;
    }
    example += `  }\n`;
    example += `}`;
    
    return example;
}

// ==================== API生成器方法 ====================

// 生成API方法
function generateApiMethod() {
    const description = document.getElementById('apiDescription').value.trim();
    const apiPath = document.getElementById('apiPath').value.trim();
    const hostConstant = document.getElementById('hostConstant').value;
    let methodName = document.getElementById('methodName').value.trim();
    
    if (!description) {
        showStatus('请输入接口描述', 'error');
        return;
    }
    
    if (!apiPath) {
        showStatus('请输入API路径', 'error');
        return;
    }
    
    // 如果没有输入方法名，则自动生成
    if (!methodName) {
        methodName = generateMethodNameFromPath(apiPath);
        document.getElementById('methodName').value = methodName;
    }
    
    try {
        const apiCode = generateApiCode(description, apiPath, hostConstant, methodName);
        document.getElementById('generatedApiCode').value = apiCode;
        
        // 显示文件路径区域
        document.getElementById('apiFilePathsSection').style.display = 'block';
        
        showStatus('API方法生成成功！', 'success');
    } catch (error) {
        console.error('生成API方法失败：', error);
        showStatus('生成失败：' + error.message, 'error');
    }
}

// 从API路径生成方法名
function generateMethodNameFromPath(apiPath) {
    // 移除开头的斜杠和版本号
    let path = apiPath.replace(/^\/+/, '').replace(/^api\/v\d+\//, '');
    
    // 分割路径并转换为驼峰命名
    const parts = path.split('/').filter(part => part.length > 0);
    
    if (parts.length === 0) {
        return 'apiMethod';
    }
    
    // 第一个部分保持小写，后续部分首字母大写
    let methodName = parts[0];
    for (let i = 1; i < parts.length; i++) {
        methodName += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    
    // 移除特殊字符
    methodName = methodName.replace(/[^a-zA-Z0-9]/g, '');
    
    return methodName || 'apiMethod';
}

// 生成API代码
function generateApiCode(description, apiPath, hostConstant, methodName) {
    const includeComment = document.getElementById('includeComment').checked;
    const staticMethod = document.getElementById('staticMethod').checked;
    const asyncMethod = document.getElementById('asyncMethod').checked;
    const returnString = document.getElementById('returnString').checked;
    const returnType = document.getElementById('returnType').value;
    
    let code = '';
    
    // 添加注释
    if (includeComment) {
        code += `  //${description}\n`;
    }
    
    // 构建方法签名
    code += '  ';
    if (staticMethod) {
        code += 'static ';
    }
    
    if (asyncMethod) {
        code += 'Future<';
        if (returnString) {
            code += 'String';
        } else {
            code += returnType;
        }
        code += '> ';
    } else {
        if (returnString) {
            code += 'String ';
        } else {
            code += returnType + ' ';
        }
    }
    
    code += `${methodName}() `;
    
    if (asyncMethod) {
        code += 'async ';
    }
    
    code += '{\n';
    
    // 方法体
    if (returnString || returnType === 'String') {
        code += `    return "\${await genHttpProtocol(HostConstDef.${hostConstant})}${apiPath}";\n`;
    } else if (returnType === 'void') {
        code += `    // TODO: 实现API调用逻辑\n`;
        code += `    // final url = "\${await genHttpProtocol(HostConstDef.${hostConstant})}${apiPath}";\n`;
    } else {
        code += `    // TODO: 实现API调用逻辑\n`;
        code += `    final url = "\${await genHttpProtocol(HostConstDef.${hostConstant})}${apiPath}";\n`;
        code += `    // 返回API调用结果\n`;
        code += `    return null; // 请根据实际需求修改返回值\n`;
    }
    
    code += '  }';
    
    return code;
}

// 清空API字段
function clearApiFields() {
    document.getElementById('apiDescription').value = '';
    document.getElementById('apiPath').value = '';
    document.getElementById('methodName').value = '';
    document.getElementById('generatedApiCode').value = '';
    document.getElementById('hostConstant').selectedIndex = 0;
    document.getElementById('returnType').selectedIndex = 0;
    
    // 隐藏文件路径区域
    document.getElementById('apiFilePathsSection').style.display = 'none';
    
    showStatus('已清空所有字段', 'info');
}

// 加载API示例
function loadApiExample() {
    document.getElementById('apiDescription').value = '请求AI生成歌词接口';
    document.getElementById('apiPath').value = '/api/v1/c2s/submitDtlTask';
    document.getElementById('hostConstant').value = 'HOST_SOLO';
    document.getElementById('methodName').value = 'submitDtlTask';
    
    // 自动生成示例代码
    generateApiMethod();
    
    showStatus('已加载示例数据', 'success');
}

// 复制API文件路径
async function copyApiFilePath() {
    const filePath = document.getElementById('apiServiceFilePath').textContent;
    try {
        await navigator.clipboard.writeText(filePath);
        showStatus('文件路径复制成功！', 'success');
    } catch (err) {
        showStatus('复制失败，请手动复制', 'error');
    }
}

// 下载API文件
function downloadApiFile() {
    const apiCode = document.getElementById('generatedApiCode').value;
    if (!apiCode.trim()) {
        showStatus('请先生成API方法', 'error');
        return;
    }
    
    const methodName = document.getElementById('methodName').value || 'apiMethod';
    const description = document.getElementById('apiDescription').value || 'API方法';
    
    // 生成完整的Dart文件内容
    const fullContent = generateFullApiFile(apiCode, description, methodName);
    
    const fileName = `${convertToSnakeCase(methodName)}_api.dart`;
    downloadFile(fullContent, fileName);
    
    showStatus(`文件 ${fileName} 下载成功！`, 'success');
}

// 生成完整的API文件内容
function generateFullApiFile(apiCode, description, methodName) {
    const className = convertToPascalCase(methodName) + 'Api';
    
    return `// ${description}
// 自动生成的API文件
// 生成时间: ${new Date().toLocaleString()}

import 'package:flutter/foundation.dart';

class ${className} {
${apiCode}
}

// 使用示例:
// final url = await ${className}.${methodName}();
// print('API URL: \$url');
`;
}

// 下载API文件含使用示例
function downloadApiWithExample() {
    const apiCode = document.getElementById('generatedApiCode').value;
    if (!apiCode.trim()) {
        showStatus('请先生成API方法', 'error');
        return;
    }
    
    const methodName = document.getElementById('methodName').value || 'apiMethod';
    const description = document.getElementById('apiDescription').value || 'API方法';
    const apiPath = document.getElementById('apiPath').value;
    const hostConstant = document.getElementById('hostConstant').value;
    
    // 生成包含详细使用示例的文件
    const fullContent = generateApiFileWithExample(apiCode, description, methodName, apiPath, hostConstant);
    
    const fileName = `${convertToSnakeCase(methodName)}_api_with_example.dart`;
    downloadFile(fullContent, fileName);
    
    showStatus(`文件 ${fileName} 下载成功！`, 'success');
}

// 生成包含使用示例的API文件
function generateApiFileWithExample(apiCode, description, methodName, apiPath, hostConstant) {
    const className = convertToPascalCase(methodName) + 'Api';
    
    return `// ${description}
// 自动生成的API文件（含使用示例）
// 生成时间: ${new Date().toLocaleString()}

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ${className} {
${apiCode}

  // 示例：实际的API调用方法
  static Future<Map<String, dynamic>> call${convertToPascalCase(methodName)}(Map<String, dynamic> requestData) async {
    try {
      final url = await ${methodName}();
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode(requestData),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('API调用失败: \${response.statusCode}');
      }
    } catch (e) {
      if (kDebugMode) {
        print('${description}调用失败: \$e');
      }
      rethrow;
    }
  }
}

// 使用示例:
/*
void main() async {
  try {
    // 获取API URL
    final url = await ${className}.${methodName}();
    print('API URL: \$url');
    
    // 调用API
    final requestData = {
      // 在这里添加请求参数
      'param1': 'value1',
      'param2': 'value2',
    };
    
    final result = await ${className}.call${convertToPascalCase(methodName)}(requestData);
    print('API响应: \$result');
  } catch (e) {
    print('错误: \$e');
  }
}
*/

// 常量定义示例（请根据实际项目调整）
/*
class HostConstDef {
  static const String ${hostConstant} = 'https://your-api-domain.com';
}

Future<String> genHttpProtocol(String host) async {
  // 根据实际需求实现协议生成逻辑
  return host;
}
*/
`;
}

// 转换为蛇形命名
function convertToSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

// 转换为帕斯卡命名
function convertToPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==================== 页面初始化 ====================

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 显示页面加载完成消息
    showStatus('页面加载完成，可以开始使用', 'info');
    
    // 监听API路径输入，自动生成方法名
    const apiPathInput = document.getElementById('apiPath');
    const methodNameInput = document.getElementById('methodName');
    
    if (apiPathInput && methodNameInput) {
        // 监听API路径输入变化
        apiPathInput.addEventListener('input', function() {
            const path = this.value.trim();
            const isUserModified = methodNameInput.getAttribute('data-user-modified') === 'true';
            
            if (path && !isUserModified) {
                // API路径有值且用户未手动修改方法名时，自动生成方法名
                const generatedName = generateMethodNameFromPath(path);
                methodNameInput.value = generatedName;
            } else if (!path && !isUserModified) {
                // API路径被清空且用户未手动修改时，清空方法名
                methodNameInput.value = '';
            }
        });
        
        // 监听API路径失去焦点
        apiPathInput.addEventListener('blur', function() {
            const path = this.value.trim();
            const isUserModified = methodNameInput.getAttribute('data-user-modified') === 'true';
            
            if (path && !methodNameInput.value.trim() && !isUserModified) {
                const generatedName = generateMethodNameFromPath(path);
                methodNameInput.value = generatedName;
            }
        });
        
        // 监听方法名输入变化
        methodNameInput.addEventListener('input', function() {
            const currentPath = apiPathInput.value.trim();
            const currentMethodName = this.value.trim();
            
            if (currentPath && currentMethodName) {
                const autoGeneratedName = generateMethodNameFromPath(currentPath);
                // 判断用户是否手动修改了方法名
                if (currentMethodName !== autoGeneratedName) {
                    this.setAttribute('data-user-modified', 'true');
                } else {
                    this.removeAttribute('data-user-modified');
                }
            } else if (!currentMethodName) {
                // 如果方法名被清空，移除手动修改标记
                this.removeAttribute('data-user-modified');
            }
        });
        
        // 监听方法名失去焦点
        methodNameInput.addEventListener('blur', function() {
            const currentPath = apiPathInput.value.trim();
            const currentMethodName = this.value.trim();
            
            // 如果方法名为空但API路径有值，自动生成方法名
            if (!currentMethodName && currentPath) {
                const generatedName = generateMethodNameFromPath(currentPath);
                this.value = generatedName;
                this.removeAttribute('data-user-modified');
            }
        });
    }
});

// 根据配置生成API方法
function generateApiMethodFromConfig(reqResult, respResult) {
    const description = document.getElementById('apiDescription').value.trim();
    const apiPath = document.getElementById('apiPath').value.trim();
    const hostConstant = document.getElementById('hostConstant').value;
    let methodName = document.getElementById('methodName').value.trim();
    
    // 如果没有填写API配置，返回提示信息
    if (!description && !apiPath) {
        return `// API方法生成器
// 请填写以下配置来生成API方法：
// 1. 接口描述：用作方法注释
// 2. API路径：如 /api/v1/c2s/submitDtlTask
// 3. Host常量：选择合适的Host常量
// 4. 方法名称：会根据API路径自动生成

// 示例配置：
// 接口描述：请求AI生成歌词接口
// API路径：/api/v1/c2s/submitDtlTask
// Host常量：HOST_SOLO
// 方法名称：submitDtlTask

// 生成的代码示例：
/*
//请求AI生成歌词接口
static Future<String> submitDtlTask() async {
  return "\${await genHttpProtocol(HostConstDef.HOST_SOLO)}/api/v1/c2s/submitDtlTask";
}
*/`;
    }
    
    // 如果没有输入方法名，则自动生成
    if (!methodName && apiPath) {
        methodName = generateMethodNameFromPath(apiPath);
    }
    
    // 如果仍然没有方法名，使用默认名称
    if (!methodName) {
        methodName = 'apiMethod';
    }
    
    try {
        // 使用现有的API代码生成函数
        const apiCode = generateApiCode(description || '生成的API方法', apiPath || '/api/example', hostConstant, methodName);
        
        // 添加类包装和导入语句
        const className = convertToPascalCase(methodName) + 'Api';
        
        let fullCode = `// ${description || '生成的API方法'}
// 自动生成的API文件
// 生成时间: ${new Date().toLocaleString()}

import 'package:flutter/foundation.dart';

class ${className} {
${apiCode}
}

// 使用示例:
// final url = await ${className}.${methodName}();
// print('API URL: \$url');

// 与Request/Response类配合使用示例:
/*
final request = ${reqResult.className}(
  // 填写请求参数
);

final url = await ${className}.${methodName}();
var content = jsonEncode(request);
var response = await ReqBaseService.mContentEncodeReq(url, content);
if(response != null) {
  final result = ${respResult.className}.fromJson(response);
  // 处理响应结果
}
*/`;
        
        return fullCode;
    } catch (error) {
        return `// API方法生成失败
// 错误信息: ${error.message}
// 请检查配置是否正确`;
    }
}

 