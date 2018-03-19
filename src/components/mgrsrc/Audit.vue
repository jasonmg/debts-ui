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
                                        <el-option label="鉴权用户名称" value="auditName"></el-option>
                                    </el-select>
                                    <el-button type="danger" class="danger" slot="append" icon="search" @click="query"></el-button>
                                </el-input>
                            </li>
                        </ul>
                        <!-- 操作 -->
                        <ul class="btn-edit fr">
                            <li >
                                <el-button type="primary" icon="edit" @click="dialogCreateVisible = true">添加鉴权</el-button>
                                <!--<el-button type="primary" icon="delete" :disabled="selected.length==0" @click="removeUsers()" >删除</el-button>-->
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
                            <!--@sort-change="tableSortChange" @selection-change="tableSelectionChange"-->
                            <!--<el-table-column type="selection" width="50"></el-table-column>-->
                            <el-table-column fixed prop="id" label="编号" width="80"></el-table-column>
                            <el-table-column prop="auditIp" label="主机地址" width="150" sortable="custom"></el-table-column>
                            <el-table-column prop="auditPort" label="主机端口" width="100"></el-table-column>
                            <el-table-column prop="auditName" label="鉴权用户名称" width="150"></el-table-column>
                            <el-table-column prop="auditPwd" label="鉴权用户密码" width="150"></el-table-column>
                            <el-table-column prop="ctime" sortable="custom" label="鉴权时间" width="200">
                                <template scope="scope">
                                    <el-icon name="time"></el-icon>
                                    <span style="margin-left: 5px, margin-right: 5px">
                                        {{ new Date(scope.row.ctime).toLocaleString() }}
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="note" label="说明"></el-table-column>
                            <el-table-column fixed="right" inline-template label="操作" width="150">
                                <span>
                                    <el-button type="primary" size="mini" @click="removeAudit(row)">删除</el-button>
                                    <el-button class="hidden" type="primary" size="mini" @click="setCurrent(row)">编辑</el-button>
                                </span>
                            </el-table-column>
                        </el-table>
                        <!--分页begin-->
                        <el-pagination class="tc mg" :current-page="filter.page" :page-sizes="[10, 20, 50, 100]" :page-size="filter.per_page" layout="total, sizes, prev, pager, next, jumper" :total="total_rows" @size-change="pageSizeChange" @current-change="pageCurrentChange">
                        </el-pagination>
                        <!--分页end-->
                    </div>
                </div>
            </section>
        </section>

        <!-- 创建用户 begin-->
        <el-dialog title="创建鉴权" v-model="dialogCreateVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="reset" >
            <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="100px">
                <el-form-item label="主机地址" prop="auditIp">
                    <el-input v-model="create.auditIp"></el-input>
                </el-form-item>
                <el-form-item label="主机端口" prop="auditPort">
                    <el-input v-model="create.auditPort"></el-input>
                </el-form-item>
                <el-form-item label="鉴权用户名称" prop="auditName">
                    <el-input v-model="create.auditName"  auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="鉴权用户密码" prop="auditPwd">
                    <el-input v-model="create.auditPwd" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogCreateVisible = false">取 消</el-button>
                <el-button type="primary" :loading="createLoading" @click="createAudit">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 修改用户 begin-->
        <el-dialog title="修改鉴权信息" v-model="dialogUpdateVisible"  :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form id="#update" :model="update" :rules="updateRules" ref="update" label-width="100px">
                <el-form-item label="主机端口" prop="auditPort">
                    <el-input v-model="update.auditPort"></el-input>
                </el-form-item>
                <el-form-item label="鉴权密码" prop="auditPwd" >
                    <el-input v-model="update.auditPwd" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogUpdateVisible = false">取 消</el-button>
                <el-button type="primary" :loading="updateLoading" @click="updateAudit">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import { msgList } from '../../constants/msg.const'
    import { auditsUrl } from '../../constants/fetch.const'

    let placeholders = {"auditIp":"请输入查找Ip地址","auditName":"请输入查找鉴权名"};

    export default {
        data: function() {
            return {
                loading: true,
                createLoading: false, //创建加载状态显示
                dialogCreateVisible: false, //创建对话框的显示状态
                updateLoading: false,//编辑加载状态显示
                dialogUpdateVisible: false, //编辑对话框的显示状态
                currentAuditId:'', //当前编辑删除的Id
                audits: [],
                filter: {
                    per_page: 8, // 页大小
                    page: 1, // 当前页
                    auditIp:'',
                    auditPort:'',
                    auditName:'',
                    ctime:'',
                    sorts:'',
                    type:'',
                    userId:''
                },
                create: {
                    id: '',
                    auditIp: '',
                    auditPort: '',
                    auditName: '',
                    auditPwd: '',
                    userId:''
                },
                update: {
                    id: '',
                    auditPort: '',
                    auditPwd: ''
                },
                total_rows: 0,
                selected: [], //已选择项
                rules: {
                    auditIp: [
                        { required: true, message: '请输入鉴权地址', trigger: 'blur' }
                        // { min: 7, max: 15, message: '长度在 7 到 15 个字符'},
                        // { pattern:/[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/, message: 'ip地址格式错误'}
                    ],
                    auditPort: [
                        { required: true, message: '请输入端口号', trigger: 'blur' },
                        { pattern:/^[0-9]+$/, message: '端口只能为数字'}
                    ],
                    auditName: [
                        { required: true, message: '请输入用户', trigger: 'blur' },
                    ],
                    auditPwd: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                    ]
                },
                keywords: '', //搜索框的关键字内容
                select: 'auditName', //搜索框的搜索字段
                updateRules: {
                    auditPort: [
                        { required: true, message: '请输入端口号', trigger: 'blur' },
                        { pattern:/^[0-9]+$/, message: '端口只能为数字'}
                    ],
                    auditPwd: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                    ]
                },
            }
        },
        mounted: function() {
            this.filter.type = this.$route.params.type;
            this.filter.userId = localStorage.getItem('user');
            this.create.userId = localStorage.getItem('user');
            this.getAudits();
        },
        watch: {
            $route ( ) {
                this.filter.type = this.$route.params.type;
                this.getAudits();
            }
        },
        methods: {
            pageSizeChange(val) {
                this.filter.per_page = val;
                this.getAudits();
            },
            pageCurrentChange(val) {
                this.filter.page = val;
                this.getAudits();
            },
            query(){
                this.filter.auditIp = '';
                this.filter.auditPort = '';
                this.filter.auditName = '';
                this.filter.ctime = '';
                this.filter[this.select] = this.keywords;
                this.getAudits();
            },
            // 重置表单
            reset() {
                this.$refs.create.resetFields();
            },
            searchFieldChange(val) {
                this.placeholder=placeholders[val];
            },
            // 获取鉴权列表
            getAudits() {
                this.loading = true;
                let resource = this.$resource(auditsUrl);
                resource.query(this.filter)
                        .then((response) => {
                            if(response.data.code=='0'){
                                this.audits = response.data.data;
                                this.total_rows = response.data.rows;
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
                        this.create.type = this.filter.type;
                        let resource = this.$resource(auditsUrl);
                        resource.save(JSON.stringify(this.create))
                                .then((response) => {
                                    if(response.data.code=='0'){
                                        this.$message.success('创建用户成功！');
                                        this.dialogCreateVisible=false;
                                        this.createLoading=false;
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
                                        this.$message.error(data[0]["message"]);
                                    }
                                    else if(data instanceof Object){
                                        this.$message.error(data["message"]);
                                    }
                                    this.createLoading=false;
                                });
                    }
                    else {
                        return false;
                    }
                });
            },
            setCurrent(audit){
                this.currentAuditId=audit.id;
                this.update.id=audit.id;
                this.update.auditPort=audit.auditPort;
                this.update.auditPwd=audit.auditPwd;
                this.dialogUpdateVisible=true;
            },
            // 更新鉴权信息
            updateAudit() {
                this.$refs.update.validate((valid) => {
                    if (valid) {
                        this.updateLoading=true;
                        let actions = {
                            update: {method: 'patch'}
                        }
                        let resource = this.$resource(auditsUrl,{},actions);
                        console.log(this.update)
//                        resource.update({"id":this.currentAuditId},this.update)
                        resource.update(this.update)
                                .then((response) => {
                                    this.$message.success('修改鉴权资料成功！');
                                    this.dialogUpdateVisible=false;
                                    this.updateLoading=false;
                                    this.getAudits();
                                })
                                .catch((response) => {
                                    let data=response.data;
                                    console.log(data);
                                    if(data instanceof Array){
                                        this.$message.error(data[0]["message"]);
                                    }
                                    else if(data instanceof Object){
                                        this.$message.error(data["message"]);
                                    }
                                    this.updateLoading=false;
                                });
                    }
                    else {
                        return false;
                    }
                });
            },
            // 删除单个鉴权
            removeAudit(audit){
                this.$confirm('此操作将删除 ' + audit.auditIp + " - " + audit.auditName + ', 并且删除该鉴权的所有申请和同步, 是否继续?', '提示', { type: 'warning' })
                        .then(() => {
                            // 向请求服务端删除
                            let resource = this.$resource(auditsUrl);
                            resource.delete({ id: audit.id })
                                    .then((response) => {
                                        this.$message.success('成功删除了主机：' + audit.auditIp + ' 鉴权：'+audit.auditName);
                                        this.getAudits();
                                    })
                                    .catch((response) => {
                                        this.$message.error('删除失败!');
                                    });
                        })
                        .catch(() => {
                            this.$message.info('已取消操作!');
                        });
            },
            //删除多个鉴权（展示不用）
            removeUsers() {
                this.$confirm('此操作将永久删除 ' + this.selected.length + ' 个鉴权, 是否继续?', '提示', { type: 'warning' })
                        .then(() => {
                            console.log(this.selected);
                            let ids = [];
                            //提取选中项的id
                            $.each(this.selected,(i, audit)=> {
                                ids.push(audit.id);
                            });
                            // 向请求服务端删除
                            let resource = this.$resource(auditsUrl);
                            resource.remove({ids: ids.join(",") })
                                    .then((response) => {
                                        this.$message.success('删除了' + this.selected.length + '个鉴权!');
                                        this.getUsers();
                                    })
                                    .catch((response) => {
                                        this.$message.error(msgList.DELETE_FAIL);
                                    });
                        })
                        .catch(() => {
                            this.$Message(msgList.CANCEL_OP);
                        });
            }

        }
    }
</script>
<style scoped>
    @import '../../assets/css/bootstrap.css';
    @import '../../assets/css/global.css';
    @import '../../assets/css/main.min.css';
</style>
