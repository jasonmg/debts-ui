<template lang="html">
    <div id="audit">
        <section  class="main-content-wrapper wrapper" >
            <section id="main-content" >
                <div class="row">
                    <div class="col-md-12">
                        <!-- 查询 -->
                        <ul class="btn-edit fl">
                            <li class="input-serach">
                                <el-input  v-model="keywords" style="width: 500px;">
                                    <el-select v-model="select" @change="searchFieldChange" slot="prepend">
                                        <el-option label="主机地址" value="auditIp"></el-option>
                                        <el-option label="文件名称" value="fileName"></el-option>
                                    </el-select>
                                    <el-button type="danger" class="danger" slot="append" icon="search" @click="query"></el-button>
                                </el-input>
                            </li>
                        </ul>
                        <!-- 用户列表-->
                        <el-table
                            :data="audits"
                            stripe
                            border
                            v-loading="loading"
                            element-loading-text="拼命加载中..."
                            style="width: 100%"
                            height="443"
                            >
                            <el-table-column fixed prop="id" label="编号" width="80"></el-table-column>
                            <!--<el-table-column prop="auditId" label="鉴权id" width="100" hidden></el-table-column>-->
                            <el-table-column sortable="custom" prop="auditIp" label="主机地址" width="120"></el-table-column>
                            <el-table-column prop="auditPort" label="主机端口" width="100"></el-table-column>
                            <el-table-column prop="auditName" label="鉴权用户名称" width="120"></el-table-column>
                            <el-table-column prop="auditPwd" label="鉴权用户密码" width="120"></el-table-column>
                            <el-table-column prop="fileName" label="文件名称" width="150" :show-overflow-tooltip="true"></el-table-column>
                            <el-table-column prop="isFull" label="是否全量" width="100"></el-table-column>
                            <el-table-column prop="fullPulled" label="全量拉取完成" width="120"></el-table-column>
                            <el-table-column prop="kafkaServer" label="kafka服务器" width="150" :show-overflow-tooltip="true">
                            </el-table-column>
                            <el-table-column label="kafka topic" width="200" :show-overflow-tooltip="true">
                                <template scope="scope">
                                    <a :href="'/ws?topic=' + scope.row.kafkaTopic"  target="_blank">{{scope.row.kafkaTopic}}</a>
                                </template>
                            </el-table-column>
                            <el-table-column prop="remakr" label="说明" :show-overflow-tooltip="true"></el-table-column>
                            <el-table-column fixed="right" inline-template label="操作" width="150">
                                <span>
                                    <el-button type="primary" size="mini" @click="removeAudit(row)">删除</el-button>
                                    <el-button type="primary" size="mini" @click="addFile(row)">添加监控</el-button>
                                </span>
                            </el-table-column>
                        </el-table>
                        <!--分页begin-->
                        <el-pagination class="tc mg" :current-page="filter.pageno" :page-sizes="[10, 20, 50, 100]" :page-size="filter.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total_rows" @size-change="pageSizeChange" @current-change="pageCurrentChange">
                        </el-pagination>
                        <!--分页end-->
                    </div>
                </div>
            </section>
        </section>

        <!-- 创建用户 begin-->
        <el-dialog title="创建鉴权" v-model="dialogCreateVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="reset" >
            <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="100px">
                <el-form-item label="文件名称" prop="fileName">
                    <el-input v-model="create.fileName"></el-input>
                </el-form-item>
                <el-form-item label="选择文件" prop="files">
                    <el-tree class="myTree" :data="regions" :props="props" :load="loadNode" lazy  @node-click="handleNodeClick"  :indent="50">
                    </el-tree>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogCreateVisible = false">取 消</el-button>
                <el-button type="primary" :loading="createLoading" @click="createAudit">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import { msgList } from 'constants/msg.const'
    import { logApplyUrl } from '../../constants/fetch.const'

    let placeholders={"auditIp":"请输入查找Ip地址","fileName":"请输入查找鉴权名"};

    export default {
        data: function() {
            return {
                loading: true,
                createLoading: false, //创建加载状态显示
                dialogCreateVisible: false, //创建对话框的显示状态
                updateLoading: false,//编辑加载状态显示
                dialogUpdateVisible: false, //编辑对话框的显示状态
                currentLogId:'', //当前编辑删除的Id
                audits: [],
                filter: {
                    pagesize: 10, // 页大小
                    pageno: 1, // 当前页
                    auditIp:'',
                    fileName:'',
                    sorts:'',
                    userId:''
                },
                create: {
                    auditId : '',
                    auditIp : '',
                    auditPort : '',
                    auditName: '',
                    auditPwd: '',
                    fileName: '',
                    isFull: '',
                    remark: ''
                },
                update: {
                    id: '',
                    ip: '',
                    files: ''
                },
                total_rows: 0,
                selected: [], //已选择项
                rules: {
                    fileName: [
                        { required: true, message: '请输入用户', trigger: 'blur' },
                    ]
                },
                keywords: '', //搜索框的关键字内容
                select: 'auditIp', //搜索框的搜索字段
                regions: [{ name: '/', type: 'dir' , path: '/', isLeaf: true }],
                props: {
                    label: 'name',
                    children: 'zones'
                }
            }
        },
        mounted: function() {
            this.filter.userId = localStorage.getItem('user');
            this.getAudits();
        },
        methods: {

            pageSizeChange(val) {
                this.filter.pagesize = val;
                this.getAudits();
            },
            pageCurrentChange(val) {
                this.filter.pageno = val;
                this.getAudits();
            },
            query(){
                this.filter.auditIp = '';
                this.filter.fileName = '';
                this.filter[this.select] = this.keywords;
                this.getAudits();
            },
            // 重置表单
            reset() {
                this.$refs.create.resetFields();
            },
            searchFieldChange(val) {
                this.placeholder=placeholders[val];
                console.log(`搜索字段： ${val} `);
            },
            // 获取鉴权列表
            getAudits() {
                this.loading = true;
//                let resource = this.$resource('http://localhost:8011/flumeapply/getPage');
                let resource = this.$resource(logApplyUrl);
                resource.query(this.filter)
                        .then((response) => {
                            if(response.data.code==='0'){
                                this.audits = response.data.data;
                                this.total_rows = response.data.rows || 1;
                                this.loading = false;
                                this.selected.splice(0,this.selected.length);
                            }else{
                                this.$message.error(msgList.GET_DATA_FAIL);
                                this.loading = false;
                            }

                        })
                        .catch((response)=> {
                            this.$message.error(msgList.SERVER_FAIL);
                            this.loading = false;
                        });
            },
            // 创建鉴权
            createAudit(){
                // 主动校验
                this.$refs.create.validate((valid) => {
                    if (valid) {
                        this.createLoading=true;
//                        let resource = this.$resource('http://10.0.31.145:8011/flumeapply/apply');
                        let resource = this.$resource(logApplyUrl);
                        resource.save(JSON.stringify(this.create))
                                .then((response) => {
                                    //console.log(this.create)
                                    if(response.data.code==="1"){
                                        this.$message.success('创建监控成功！');
                                        this.dialogCreateVisible=false;
                                        this.reset();
                                        this.getAudits();
                                    }else{
                                        this.$message.error(response.data.errmsg);
                                    }
                                    this.createLoading=false;
                                })
                                .catch((response) => {
                                    let data=response.data;
                                    if(data instanceof Array){
                                        this.$message.error(response.data.errmsg);
                                    }
                                    else if(data instanceof Object){
                                        this.$message.error(response.data.errmsg);
                                    }
                                    this.dialogCreateVisible=false;
                                    this.createLoading=false;
                                });
                    } else {
                        return false;
                    }
                });
            },
            addFile(audit){
                this.create.auditId=audit.auditId;
                this.create.auditIp=audit.auditIp;
                this.create.auditPort=audit.auditPort;
                this.create.auditName=audit.auditName;
                this.create.auditPwd=audit.auditPwd;
                this.create.kafkaServer=audit.kafkaServer;
                this.create.kafkaTopic=audit.kafkaTopic;
                this.regions = [{ name: '/', type: 'dir' , path: '/', isLeaf: true }];
                this.dialogCreateVisible=true;
            },
            // 删除单个鉴权
            removeAudit(audit){
                //console.log(audit);
                this.$confirm('此操作将删除 ' + audit.auditIp + " - " + audit.fileName + ' 文件数据同步, 是否继续?', '提示', { type: 'warning' })
                        .then(() => {
                            // 向请求服务端删除
                            let resource = this.$resource(logApplyUrl);
                            resource.delete({ id: audit.id })
                                    .then((response) => {
                                        this.$message.success('成功删除了同步文件：' + audit.auditIp + ' 鉴权：'+audit.fileName);
                                        this.getAudits();
                                    })
                                    .catch((response) => {
                                        this.$message.error(msgList.DELETE_FAIL);
                                    });
                        })
                        .catch(() => {
                            this.$message.info(msgList.CANCEL_OP);
                        });
            },
            handleNodeClick(data) {
                if(data.type==="file"){
                    this.create.fileName=data.path;
                }
            },
            loadNode(node, resolve) {
                console.log(node.level)
                if (node.level === 0) {
                    return resolve([{ name: '/', type: 'dir' , path: '/', isLeaf: true }]);
                }

                //多少级就不再往下执行load
                if (node.level > 5) return resolve([]);

                let hasChild;
                if (node.data.type === 'dir') {
                    hasChild = true;
                } else if (node.data.type === 'file') {
                    hasChild = false;
                    //改变节点状态，例如不在刷新加载
                }
                setTimeout(() => {
                    let data=[];
                    if (hasChild) {
                        // 向请求服务端目录
                        let resource = this.$resource('/api/listfiles');
                        this.create.fileName = node.data.path;
                        console.log(this.create);
                        resource.save(JSON.stringify(this.create))
                                .then(response => resolve(response.data.data))
                                .catch((response) => {
                                    this.$message.error('远程主机返回失败::'+response.data.errmsg);
                                });
                    } else {
                        data = [];
                        resolve(data);
                    }
                }, 500);
            }
        },
    }
</script>
<style scoped>
    @import '../../assets/css/bootstrap.css';
    @import '../../assets/css/global.css';
    @import '../../assets/css/main.min.css';
    .myTree{
        text-align: left;
    }
</style>
