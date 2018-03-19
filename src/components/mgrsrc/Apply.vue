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
                                        <el-option label="库名称" value="dbName"></el-option>
                                        <el-option label="表名称" value="tableName"></el-option>
                                    </el-select>
                                    <el-button type="danger" class="danger" slot="append" icon="search" @click="query"></el-button>
                                </el-input>
                            </li>
                        </ul>
                        <!-- 操作 -->
                        <ul class="btn-edit fr">
                            <li >
                                <el-button type="primary" icon="edit" @click="dialogCreateVisible = true">添加申请</el-button>
                                <el-button type="primary" icon="edit" @click="applySync">同步申请</el-button>
                                <!--<el-button type="primary" icon="delete" :disabled="selected.length==0" @click="removeUsers()" >删除</el-button>-->
                            </li>
                        </ul>
                        <!-- 用户列表-->
                        <el-table
                            class="apply-table"
                            :data="applys"
                            stripe
                            border
                            v-loading="loading"
                            element-loading-text="拼命加载中..."
                            style="width: 100%"
                            max-height="443"
                            >
                            <!--@sort-change="tableSortChange" @selection-change="tableSelectionChange"-->
                            <!--<el-table-column type="selection" width="50"></el-table-column>-->
                            <el-table-column fixed prop="id" label="编号" width="80"></el-table-column>
                            <!--<el-table-column prop="auditId" label="鉴权id" width="100" hidden></el-table-column>-->
                            <el-table-column prop="auditIp" label="主机地址" width="150" sortable="custom"></el-table-column>
                            <el-table-column prop="auditPort" label="主机端口" width="100"></el-table-column>
                            <el-table-column prop="auditName" label="鉴权用户名称" width="120"></el-table-column>
                            <el-table-column prop="auditPwd" label="鉴权用户密码" width="120"></el-table-column>
                            <el-table-column prop="dbName" label="申请库名称" width="150"></el-table-column>
                            <el-table-column prop="tableName" label="申请表名称" width="150" :show-overflow-tooltip="true"></el-table-column>
                            <el-table-column prop="tableComment" label="表名称说明" width="120"></el-table-column>
                            <el-table-column prop="isFull" label="是否包含历史" width="120"></el-table-column>
                            <el-table-column prop="kafkaServer" label="kafka服务器" width="150" :show-overflow-tooltip="true"></el-table-column>
                            <el-table-column label="kafka topic" :show-overflow-tooltip="true">
                                <template scope="scope">
                                    <a class="kafka-topic-link" @click.prevent="clickTopic(scope.row.kafkaTopic)" >{{scope.row.kafkaTopic}}</a>
                                </template>
                            </el-table-column>
                            <el-table-column fixed="right" inline-template label="操作" width="80">
                                <span>
                                    <el-button type="primary" size="mini" @click="removeApply(row)">删除</el-button>
                                    <!--<el-button type="primary" size="mini" @click="setCurrent(row)">编辑</el-button>-->
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
        <el-dialog title="创建申请" v-model="dialogCreateVisible" :close-on-click-modal="false" :close-on-press-escape="false" @close="reset" >
            <el-form id="#create" :model="create" :rules="rules" ref="create" label-width="100px">
                <el-form-item label="申请选项" prop="applyIds">
                    <!--<el-cascader  size="large" placeholder="级联选择" :options="options"  v-model="selectedOptions" filterable change-on-select @change="handleChange">-->
                    <!--</el-cascader>-->
                    <el-cascader  size="large" placeholder="级联选择" :options="options"  v-model="selectedOptions" filterable>
                    </el-cascader>
                </el-form-item>
                <el-form-item label="是否包含历史数据">
                    <el-tooltip  placement="top">
                        <el-switch v-model="isFull" on-color="#13ce66" off-color="#ff4949" on-value="1" off-value="0">
                        </el-switch>
                </el-tooltip>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogCreateVisible = false">取 消</el-button>
                <el-button type="primary" :loading="createLoading" @click="createApply">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import { applyUrl, applySyncUrl, auditTreeUrl } from '../../constants/fetch.const'
    import { msgList } from '../../constants/msg.const'
    let placeholders={"dbName":"请输入查找数据库名称","tbName":"请输入查找表名称"};

    export default {
        data: function() {
            return {
                applys: [],
                isFull: 0,
                loading: true,
                createLoading: false, //创建加载状态显示
                dialogCreateVisible: false, //创建对话框的显示状态
                total_rows: 0,
                selected: [], //已选择项
                keywords: '', //搜索框的关键字内容
                select: 'dbName', //搜索框的搜索字段
                selectedOptions: [],
                options: undefined,
                filter: {
                    per_page: 10, // 页大小
                    page: 1, // 当前页
                    dbName:'',
                    tableName:'',
                    sorts:'',
                    userId:''
                },
                create: {
                    id: '',
                    auditId: '',
                    dbId: '',
                    tableId: '',
                    isFull: 0,
                    isValid: 1
                },
                rules: {
                    auditId: [
                        { required: true, message: '请选择鉴权连接', trigger: 'blur' }
                    ],
                    dbId: [
                        { required: true, message: '请选择鉴权数据库', trigger: 'blur' }
                    ]
                }
            }
        },
        mounted: function() {
            this.filter.userId = localStorage.getItem('user');
            this.create.userId = localStorage.getItem('user');
            this.getAuditTree();
            this.getApply();
        },
        methods: {
            clickTopic(topic) {
                console.log('topic', topic)
                this.$bus.$emit('changeTopic', topic)
            },
            // 获取鉴权列表
            getAuditTree() {
                this.loading = true;
                let resource = this.$resource(auditTreeUrl);
                resource.query(this.filter)
                        .then(response => {
                            if (!response.data) {
                                this.$message.error(msgList.GET_DATA_FAIL);
                                this.loading = false;
                                return;
                            } else {
                                this.options = response.data;
                                this.total_rows = response.data.rows;
                                this.loading = false;
                                this.selected.splice(0,this.selected.length);
                            }
                        })
                        .catch(response => {
                            this.$message.error(msgList.SERVER_FAIL);
                            this.loading = false;
                        });
            },
            // 创建申请
            createApply() {
                //获取当前申请数据
                this.create.auditId = this.selectedOptions[0];
                this.create.dbId = this.selectedOptions[1];
                this.create.tableId = this.selectedOptions[2];
                this.create.isFull = this.isFull;

                // 主动校验
                this.$refs.create.validate((valid) => {
                    if (valid) {
                        this.createLoading=true;

                        let resource = this.$resource(applyUrl);
                        resource.save(JSON.stringify(this.create))
                                .then((response) => {
                                    this.$message.success('创建申请成功！');
                                    this.dialogCreateVisible=false;
                                    this.createLoading=false;
                                    this.reset();
                                    this.getApply();
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
            // 获取申请列表
            getApply() {
                this.loading = true;

                let resource = this.$resource(applyUrl);
                resource.query(this.filter)
                        .then((response) => {
                            if(response.data.code=='0'){
//                                this.applys = response.data.data.map(item => {
//                                    return {
//                                        ...item,
//                                        kafkaTopic: '<a href="www.baidu.com"/>'
//                                    }
//                                })
                                this.applys = response.data.data;
                                this.total_rows = response.data.rows;
                                this.loading = false;
                                this.selected.splice(0,this.selected.length);
                            } else {
                                this.$message.error(msgList.GET_DATA_FAIL);
                                this.loading = false;
                            }

                        })
                        .catch((response)=> {
                            this.$message.error(msgList.SERVER_FAIL);
                            this.loading = false;
                        });
            },
            // 同步申请
            applySync() {
                this.loading = true;

                let resource = this.$resource(applySyncUrl);
                resource.query(this.filter)
                        .then((response) => {
                            if(response.data.code=='0'){
                                this.total_rows = response.data.rows;
                                this.loading = false;
                                this.$message.success('同步成功！');
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

            pageSizeChange(val) {
                this.filter.per_page = val;
                this.getApply();
            },
            pageCurrentChange(val) {
                this.filter.page = val;
                this.getApply();
            },
            query(){
                this.filter.dbName = '';
                this.filter.tableName = '';
                this.filter[this.select] = this.keywords;
                this.getApply();
            },
            // 重置表单
            reset() {
                this.$refs.create.resetFields();
            },
            searchFieldChange(val) {
                this.placeholder=placeholders[val];
            },
            // 删除单个用户
            removeApply(apply){
                this.$confirm('此操作将永久删除 ' + apply.auditIp + " - " + apply.dbName + " - " + apply.tableName + ', 是否继续?', '提示', { type: 'warning' })
                        .then(() => {
                             //向请求服务端删除
                            let resource = this.$resource(applyUrl);
                            resource.delete({"id":apply.id})
                                    .then((response) => {
                                        this.$message.success('成功删除了主机：' + apply.auditIp + ' 数据库：'+apply.dbName + ' 数据表：'+apply.tableName);
                                        this.getApply();
                                    })
                                    .catch((response) => {
                                        this.$message.error(msgList.DELETE_FAIL);
                                    });
                        })
                        .catch(() => {
                            this.$message.info(msgList.CANCEL_OP);
                        });
            }
        }
    }
</script>
<style scoped lang="less">
    @import '../../assets/css/bootstrap.css';
    @import '../../assets/css/global.css';
    @import '../../assets/css/main.min.css';
    .kafka-topic-link {
        text-decoration: underline;
        cursor: pointer;
        &:hover {
            color: rgb(61,56,214);
        }
    }
</style>
